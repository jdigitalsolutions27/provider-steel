import {
  LayoutDashboard,
  Inbox,
  Package,
  Wrench,
  Image,
  FileText,
  BriefcaseBusiness,
  Settings,
  Users,
  UserCircle,
  Trash2
} from "lucide-react";

export const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Inbox, key: "leads" },
  { href: "/admin/products", label: "Products", icon: Package, adminOnly: true },
  { href: "/admin/services", label: "Services", icon: Wrench, adminOnly: true },
  { href: "/admin/testimonials", label: "Testimonials", icon: BriefcaseBusiness, adminOnly: true },
  { href: "/admin/gallery", label: "Gallery", icon: Image, adminOnly: true },
  { href: "/admin/media", label: "Media", icon: Image, adminOnly: true },
  { href: "/admin/content", label: "Content", icon: FileText, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
  { href: "/admin/recycle-bin", label: "Recycle Bin", icon: Trash2, adminOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/admin/account", label: "Account", icon: UserCircle }
];

export function isPathActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageLabel(pathname: string) {
  const matched = navItems.find((item) => isPathActive(pathname, item.href));
  return matched?.label ?? "Dashboard";
}
