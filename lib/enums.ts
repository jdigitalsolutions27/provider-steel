export const InquiryTypeValues = ["PRODUCT", "SERVICE", "GENERAL"] as const;
export type InquiryType = (typeof InquiryTypeValues)[number];

export const PreferredContactValues = [
  "CALL",
  "TEXT",
  "MESSENGER",
  "WHATSAPP",
  "EMAIL"
] as const;
export type PreferredContact = (typeof PreferredContactValues)[number];

export const LeadStatusValues = ["NEW", "CONTACTED", "QUOTED", "COMPLETED", "LOST"] as const;
export type LeadStatus = (typeof LeadStatusValues)[number];

export const LeadSourceValues = [
  "WEBSITE_FORM",
  "FB_MESSAGE",
  "CALL",
  "WALKIN",
  "OTHER"
] as const;
export type LeadSource = (typeof LeadSourceValues)[number];

export const LeadPriorityValues = ["LOW", "MEDIUM", "HIGH"] as const;
export type LeadPriority = (typeof LeadPriorityValues)[number];

export const UserRoleValues = ["ADMIN", "STAFF"] as const;
export type UserRole = (typeof UserRoleValues)[number];

export const ProductCategoryValues = [
  "ROOFING",
  "ROLLUP_DOORS",
  "CEE_PURLINS",
  "ACCESSORIES",
  "COILS_ZINC"
] as const;
export type ProductCategory = (typeof ProductCategoryValues)[number];

export const ProjectStatusValues = ["ONGOING", "COMPLETED"] as const;
export type ProjectStatus = (typeof ProjectStatusValues)[number];
