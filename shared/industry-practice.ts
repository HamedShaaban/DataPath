import { sectorById } from "./catalog";
import type { Profile } from "./learning";
export type Sector = Profile["sector"];
export const industryPractice: Record<
  Sector,
  {
    entity: string;
    event: string;
    unit: string;
    categories: string[];
    decision: string;
    risk: string;
  }
> = {
  banking: {
    entity: "account",
    event: "payment",
    unit: "EGP",
    categories: ["Retail", "SME", "Corporate"],
    decision: "Prioritise payment reconciliation exceptions",
    risk: "Do not treat a flagged payment as evidence of fraud",
  },
  finance: {
    entity: "portfolio",
    event: "settlement",
    unit: "EGP",
    categories: ["Equity", "Bond", "Mixed"],
    decision: "Reconcile settled portfolio cash flows",
    risk: "Cash flow is not investment return; account for costs and exposure",
  },
  marketing: {
    entity: "campaign",
    event: "conversion",
    unit: "EGP attributed value",
    categories: ["Search", "Social", "Email"],
    decision: "Compare attributed conversion value across campaigns",
    risk: "Attribution does not establish incremental impact; check consent",
  },
  healthcare: {
    entity: "clinic",
    event: "claim",
    unit: "EGP claim value",
    categories: ["Primary", "Specialist", "Outpatient"],
    decision: "Review claims reconciliation and operational completeness",
    risk: "Synthetic operational data cannot justify clinical decisions",
  },
  retail: {
    entity: "store",
    event: "order",
    unit: "EGP order value",
    categories: ["Online", "High street", "Outlet"],
    decision: "Compare fulfilled order value and unresolved orders",
    risk: "Revenue excludes returns, costs and margin in this simplified dataset",
  },
  technology: {
    entity: "service",
    event: "job",
    unit: "compute minutes",
    categories: ["API", "Batch", "Search"],
    decision: "Identify services consuming the most completed compute time",
    risk: "Compute duration alone does not measure reliability or cost",
  },
  telecom: {
    entity: "region",
    event: "session",
    unit: "MB transferred",
    categories: ["Urban", "Rural", "Business"],
    decision: "Compare completed network traffic across regions",
    risk: "Traffic volume is not network quality; examine failures and coverage",
  },
  government: {
    entity: "office",
    event: "request",
    unit: "processing minutes",
    categories: ["Central", "Local", "Regional"],
    decision: "Review service workload and unresolved public requests",
    risk: "Workload measures must not become unsupported citizen eligibility decisions",
  },
  general: {
    entity: "team",
    event: "task",
    unit: "work minutes",
    categories: ["Operations", "Support", "Delivery"],
    decision: "Compare completed work and identify missing records",
    risk: "Small synthetic samples cannot support individual performance rankings",
  },
};
export function practiceDataset(sector: Sector) {
  const context = industryPractice[sector];
  return [
    {
      id: 1,
      entity: `${context.entity} A`,
      category: context.categories[0],
      value: 120,
      status: "completed",
    },
    {
      id: 2,
      entity: `${context.entity} B`,
      category: context.categories[1],
      value: 80,
      status: "pending",
    },
    {
      id: 3,
      entity: `${context.entity} A`,
      category: context.categories[0],
      value: 200,
      status: "completed",
    },
    {
      id: 4,
      entity: `${context.entity} C`,
      category: context.categories[2],
      value: null,
      status: "completed",
    },
    {
      id: 5,
      entity: `${context.entity} B`,
      category: context.categories[1],
      value: 60,
      status: "completed",
    },
  ];
}
export function industryBrief(sector: Sector) {
  const context = industryPractice[sector];
  return `${sectorById[sector].title}: ${context.decision}. Values are ${context.unit}. All records are synthetic. ${context.risk}.`;
}
