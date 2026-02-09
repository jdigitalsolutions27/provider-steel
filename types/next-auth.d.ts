import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      avatarUrl?: string | null;
      tokenIssuedAt?: number;
      forceLogout?: boolean;
      forceLogoutReason?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    avatarUrl?: string | null;
  }
}
