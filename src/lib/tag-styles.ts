export const TAG_LABEL: Record<string, string> = {
  BUSINESS_DEVELOPMENT: "Business Development",
  SALES: "Sales",
  PRODUCT_DEVELOPMENT: "Product Development",
  ADMINISTRATION: "Administration",
  CUSTOMER_SUCCESS: "Customer Success",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  RESEARCH: "Research",
};

export const TAG_BADGE: Record<string, string> = {
  BUSINESS_DEVELOPMENT: "bg-violet-500/15 text-violet-400 border border-violet-500/40",
  SALES: "bg-rose-500/15 text-rose-400 border border-rose-500/40",
  PRODUCT_DEVELOPMENT: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/40",
  ADMINISTRATION: "bg-zinc-500/15 text-zinc-300 border border-zinc-500/40",
  CUSTOMER_SUCCESS: "bg-teal-500/15 text-teal-400 border border-teal-500/40",
  MARKETING: "bg-pink-500/15 text-pink-400 border border-pink-500/40",
  FINANCE: "bg-lime-500/15 text-lime-400 border border-lime-500/40",
  RESEARCH: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/40",
};

export const TAG_OPTIONS = Object.keys(TAG_LABEL) as (keyof typeof TAG_LABEL)[];
