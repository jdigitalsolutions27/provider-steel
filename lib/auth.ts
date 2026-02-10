import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  clearFailedLogins,
  isLoginBlocked,
  registerFailedLogin
} from "@/lib/login-attempts";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32)
) {
  console.warn("NEXTAUTH_SECRET should be set and at least 32 chars in production.");
}

function getHeaderValue(headers: unknown, key: string): string | undefined {
  if (!headers) return undefined;
  if (typeof (headers as any).get === "function") {
    const value = (headers as any).get(key);
    return typeof value === "string" ? value : undefined;
  }
  const raw = (headers as Record<string, string | string[] | undefined>)[key];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

function getClientIp(req: unknown) {
  const headers = (req as any)?.headers;
  const forwarded = getHeaderValue(headers, "x-forwarded-for");
  const realIp = getHeaderValue(headers, "x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

async function maybeBootstrapAdmin(email: string, password: string) {
  const activeUsers = await prisma.user.count({ where: { deletedAt: null } });
  if (activeUsers > 0) return null;

  const bootstrapEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@g7provider.local").toLowerCase();
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin123!";

  if (email !== bootstrapEmail || password !== bootstrapPassword) return null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.deletedAt) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        deletedAt: null,
        role: "ADMIN",
        name: existing.name || "Admin",
        passwordHash: await hashPassword(password)
      }
    });
    return prisma.user.findUnique({ where: { id: existing.id } });
  }

  if (existing) return existing;

  return prisma.user.create({
    data: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await hashPassword(password)
    }
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        const ip = getClientIp(req);
        const fallbackKey = `invalid|${ip}`;
        if (!parsed.success) {
          registerFailedLogin(fallbackKey);
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const attemptKey = `${email}|${ip}`;
        if (isLoginBlocked(attemptKey) || isLoginBlocked(fallbackKey)) {
          return null;
        }

        let user = await prisma.user.findUnique({
          where: { email }
        });
        if (!user) {
          user = await maybeBootstrapAdmin(email, parsed.data.password);
        }

        if (!user || user.deletedAt) {
          registerFailedLogin(attemptKey);
          return null;
        }

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValid) {
          registerFailedLogin(attemptKey);
          return null;
        }

        clearFailedLogins(attemptKey);
        clearFailedLogins(fallbackKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl
        } as any;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },
  jwt: {
    maxAge: 60 * 60 * 8
  },
  pages: {
    signIn: "/admin/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.avatarUrl = (user as any).avatarUrl || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
        session.user.tokenIssuedAt = typeof token.iat === "number" ? token.iat : undefined;

        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              name: true,
              email: true,
              role: true,
              avatarUrl: true,
              passwordChangedAt: true,
              deletedAt: true
            }
          });
          if (dbUser) {
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            session.user.role = dbUser.role;
            session.user.avatarUrl = dbUser.avatarUrl;
            const issuedAt = session.user.tokenIssuedAt ?? 0;
            const passwordReset =
              !!dbUser.passwordChangedAt && issuedAt > 0
                ? dbUser.passwordChangedAt.getTime() > issuedAt * 1000
                : false;
            const deleted = !!dbUser.deletedAt;
            session.user.forceLogout = passwordReset || deleted;
            session.user.forceLogoutReason = deleted ? "deleted" : passwordReset ? "reset" : undefined;
          } else {
            session.user.forceLogout = true;
            session.user.forceLogoutReason = "deleted";
          }
        }
      }
      return session;
    }
  }
};

export const getServerAuthSession = () => getServerSession(authOptions);
