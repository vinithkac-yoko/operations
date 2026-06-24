import { BoardTag } from "@prisma/client";

export const TAG_LABEL: Record<BoardTag, string> = {
  BUSINESS_DEVELOPMENT: "Business Development",
  SALES: "Sales",
  PRODUCT_DEVELOPMENT: "Product Development",
  ADMINISTRATION: "Administration",
  CUSTOMER_SUCCESS: "Customer Success",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  RESEARCH: "Research",
  OPERATIONS: "Operations",
};

export const TAG_BADGE: Record<BoardTag, string> = {
  BUSINESS_DEVELOPMENT: "bg-violet-500/10 text-violet-300 border border-violet-500/25",
  SALES: "bg-rose-500/10 text-rose-300 border border-rose-500/25",
  PRODUCT_DEVELOPMENT: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25",
  ADMINISTRATION: "bg-stone-500/10 text-stone-300 border border-stone-500/25",
  CUSTOMER_SUCCESS: "bg-teal-500/10 text-teal-300 border border-teal-500/25",
  MARKETING: "bg-pink-500/10 text-pink-300 border border-pink-500/25",
  FINANCE: "bg-lime-500/10 text-lime-300 border border-lime-500/25",
  RESEARCH: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/25",
  OPERATIONS: "bg-orange-500/10 text-orange-300 border border-orange-500/25",
};

export const TAG_OPTIONS = Object.keys(TAG_LABEL) as BoardTag[];
