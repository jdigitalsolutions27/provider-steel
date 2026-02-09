import { z } from "zod";
import {
  InquiryTypeValues,
  PreferredContactValues,
  LeadStatusValues,
  LeadSourceValues,
  LeadPriorityValues,
  ProductCategoryValues,
  UserRoleValues,
  ProjectStatusValues
} from "@/lib/enums";

const strongPasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character.");

export const leadCreateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  inquiryType: z.enum(InquiryTypeValues),
  productId: z.string().optional().or(z.literal("")),
  serviceId: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  preferredContact: z.enum(PreferredContactValues),
  contactLink: z.string().optional().or(z.literal("")),
  attachments: z.array(z.string()).optional()
});

export const leadUpdateSchema = z.object({
  status: z.enum(LeadStatusValues).optional(),
  source: z.enum(LeadSourceValues).optional(),
  priority: z.enum(LeadPriorityValues).optional(),
  followUpAt: z.string().optional(),
  assignedToUserId: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  shortDescription: z.string().optional().or(z.literal("")),
  specs: z.string().optional(),
  colors: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  imageUrl: z.string().min(1).optional().or(z.literal("")),
  imageUrls: z.string().optional().or(z.literal(""))
});

export const serviceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  featured: z.coerce.boolean().optional(),
  iconName: z.string().optional().or(z.literal(""))
});

export const gallerySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().min(3).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  featured: z.coerce.boolean().optional()
});

export const mediaSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  url: z.string().min(3),
  tags: z.string().optional().or(z.literal(""))
});

export const testimonialProjectSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  details: z.string().min(2, "Project details must be at least 2 characters."),
  status: z.enum(ProjectStatusValues),
  statusNote: z.string().optional().or(z.literal("")),
  imageUrl: z.string().min(3).optional().or(z.literal("")),
  imageUrls: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  completedAt: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional()
});

export const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  order: z.coerce.number().int().min(1)
});

export const whyUsSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  iconName: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(1)
});

export const siteContentSchema = z.object({
  heroHeading: z.string().min(2),
  heroSubheading: z.string().min(2),
  ctaPrimaryText: z.string().min(2),
  ctaSecondaryText: z.string().min(2),
  aboutIntro: z.string().min(2),
  aboutBody: z.string().min(10)
});

export const siteSettingsSchema = z.object({
  businessName: z.string().min(2),
  taglineMain: z.string().min(2),
  subtitle: z.string().min(2),
  serviceLine: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(5),
  messengerUrl: z.string().url().optional().or(z.literal("")),
  whatsappUrl: z.string().url().optional().or(z.literal("")),
  serviceAreas: z.string().optional().or(z.literal("")),
  galleryCategories: z.string().optional().or(z.literal("")),
  logoTextSmall: z.string().min(1)
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  role: z.enum(UserRoleValues),
  password: strongPasswordSchema
});

export const userResetSchema = z.object({
  password: strongPasswordSchema
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPasswordSchema
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    token: z
      .string()
      .min(32, "Invalid reset token.")
      .regex(/^[a-f0-9]+$/i, "Invalid reset token."),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });
