import { DEMO_INCIDENT, DEMO_SUPPLIERS } from "@/lib/demo-data";
import type { RecoveryIncident, Supplier } from "@/lib/types";

export interface RecoveryPlaybook {
  id: string;
  useCaseSlug: string;
  sector: string;
  label: string;
  promise: string;
  incident: RecoveryIncident;
  suppliers: Supplier[];
}

function roster(names: string[]): Supplier[] {
  return DEMO_SUPPLIERS.map((supplier, index) => ({ ...supplier, name: names[index] ?? supplier.name }));
}

function incident(overrides: Omit<Partial<RecoveryIncident>, "requirements"> & { requirements?: Partial<RecoveryIncident["requirements"]> }): RecoveryIncident {
  return {
    ...DEMO_INCIDENT,
    ...overrides,
    requirements: { ...DEMO_INCIDENT.requirements, ...overrides.requirements },
  };
}

export const RECOVERY_PLAYBOOKS: RecoveryPlaybook[] = [
  {
    id: "line-stop",
    useCaseSlug: "manufacturing-line-stop",
    sector: "MANUFACTURING",
    label: "Line-stop recovery",
    promise: "Verify an approved production-part fallback before the line stops.",
    incident: DEMO_INCIDENT,
    suppliers: DEMO_SUPPLIERS,
  },
  {
    id: "mro-spare",
    useCaseSlug: "maintenance-mro",
    sector: "MRO",
    label: "Critical spare",
    promise: "Recover a compatible spare and verified dispatch window for a down asset.",
    incident: incident({
      id: "REC-MRO-024",
      title: "Critical bearing assembly unavailable",
      cause: "The installed mill drive failed and the contracted MRO distributor has no releasable stock",
      buyerOrganization: "Atlas Process Industries",
      plant: "Gulf Coast Processing",
      plantTimeZone: "America/Chicago",
      productionLine: "Mill Drive A-4",
      partNumber: "BRG-440X",
      partName: "High-load bearing assembly",
      incumbentSupplier: "Prime MRO Distribution",
      shortfall: 2,
      quantityUnit: "assemblies",
      estimatedDowntimeCost: 185_000,
      requirements: {
        quantity: 2,
        maxUnitPrice: 18_500,
        requiredCertifications: ["ISO 9001", "OEM traceability"],
        approvedSubstituteParts: ["BRG-440X", "BRG-440XR"],
      },
    }),
    suppliers: roster(["Kanto Reliability", "Pacific Plant Services", "Rhein MRO Systems", "Delta Bearing Supply", "Summit Industrial MRO"]),
  },
  {
    id: "construction",
    useCaseSlug: "construction-materials",
    sector: "CONSTRUCTION",
    label: "Critical-path material",
    promise: "Replace a delayed material without losing specification or delivery slot.",
    incident: incident({
      id: "REC-SITE-031",
      title: "Structural steel delivery failure",
      cause: "The nominated fabricator missed the confirmed delivery window for a critical-path erection package",
      buyerOrganization: "Meridian Build Group",
      plant: "Harbor District Project",
      plantTimeZone: "Asia/Singapore",
      productionLine: "Tower B · Level 14",
      partNumber: "STL-HSS-400",
      partName: "Fabricated HSS structural package",
      incumbentSupplier: "Anchor Steelworks",
      shortfall: 28,
      quantityUnit: "tonnes",
      estimatedDowntimeCost: 96_000,
      requirements: {
        quantity: 28,
        maxUnitPrice: 3_200,
        requiredCertifications: ["Mill certificate", "Approved WPS"],
        approvedSubstituteParts: ["STL-HSS-400", "STL-HSS-400A"],
      },
    }),
    suppliers: roster(["Kanto Structural", "Pacific Steelworks", "Rhein Fabrication", "Delta Metals", "Summit Site Supply"]),
  },
  {
    id: "food-packaging",
    useCaseSlug: "food-packaging",
    sector: "FOOD & CPG",
    label: "Packaging allocation",
    promise: "Protect a production run while preserving material and food-safety requirements.",
    incident: incident({
      id: "REC-CPG-044",
      title: "Sterile pouch allocation shortfall",
      cause: "The contracted converter placed the confirmed packaging release on allocation",
      buyerOrganization: "Northfield Nutrition",
      plant: "Penang Foods Campus",
      plantTimeZone: "Asia/Kuala_Lumpur",
      productionLine: "Retort Line 3",
      partNumber: "PKG-RP-750",
      partName: "750 ml retort pouch",
      incumbentSupplier: "ClearPack Convertors",
      shortfall: 180_000,
      quantityUnit: "pouches",
      estimatedDowntimeCost: 128_000,
      requirements: {
        quantity: 180_000,
        maxUnitPrice: 0.31,
        requiredCertifications: ["BRCGS Packaging", "Food-contact declaration"],
        approvedSubstituteParts: ["PKG-RP-750", "PKG-RP-750B"],
      },
    }),
    suppliers: roster(["Kanto Pack", "Pacific Flexibles", "Rhein Packaging", "Delta Convertors", "Summit Food Packaging"]),
  },
  {
    id: "logistics",
    useCaseSlug: "logistics-capacity",
    sector: "LOGISTICS",
    label: "Carrier capacity",
    promise: "Recover an approved truck and pickup window before the dock closes.",
    incident: incident({
      id: "REC-LANE-052",
      title: "Export lane carrier cancellation",
      cause: "The primary carrier canceled a confirmed time-critical pickup after an equipment failure",
      buyerOrganization: "Vector Distribution",
      plant: "Ontario Fulfillment Hub",
      plantTimeZone: "America/Toronto",
      productionLine: "YYZ–ORD Priority Lane",
      partNumber: "LANE-YYZ-ORD-53",
      partName: "53-foot dry-van capacity",
      incumbentSupplier: "NorthRoute Logistics",
      shortfall: 4,
      quantityUnit: "truckloads",
      estimatedDowntimeCost: 74_000,
      requirements: {
        quantity: 4,
        maxUnitPrice: 4_600,
        requiredCertifications: ["Cargo insurance", "Cross-border authority"],
        approvedSubstituteParts: ["LANE-YYZ-ORD-53", "LANE-YYZ-ORD-TEAM"],
      },
    }),
    suppliers: roster(["Kanto Freight", "Pacific Haulage", "Rhein Logistics", "Delta Transport", "Summit Carriers"]),
  },
  {
    id: "replenishment",
    useCaseSlug: "retail-replenishment",
    sector: "RETAIL & WHOLESALE",
    label: "Stockout recovery",
    promise: "Recover a real allocation without a procurement-suite rollout.",
    incident: incident({
      id: "REC-STOCK-063",
      title: "Promotion stockout risk",
      cause: "Sell-through exceeded plan and the primary distributor cannot cover the next replenishment release",
      buyerOrganization: "Fieldstone Wholesale",
      plant: "Western Region Network",
      plantTimeZone: "America/Vancouver",
      productionLine: "Priority Replenishment Wave",
      partNumber: "SKU-HVAC-24",
      partName: "Commercial HVAC filter case",
      incumbentSupplier: "CoreLine Distribution",
      shortfall: 1_200,
      quantityUnit: "cases",
      estimatedDowntimeCost: 38_000,
      requirements: {
        quantity: 1_200,
        maxUnitPrice: 118,
        requiredCertifications: ["MERV 13 declaration", "Lot traceability"],
        approvedSubstituteParts: ["SKU-HVAC-24", "SKU-HVAC-24B"],
      },
    }),
    suppliers: roster(["Kanto Wholesale", "Pacific Distribution", "Rhein Trade Supply", "Delta Wholesale", "Summit Stock Network"]),
  },
];

export const DEFAULT_PLAYBOOK = RECOVERY_PLAYBOOKS[0];

export function getRecoveryPlaybook(id: string) {
  return RECOVERY_PLAYBOOKS.find((playbook) => playbook.id === id) ?? DEFAULT_PLAYBOOK;
}

export function materializePlaybookIncident(playbook: RecoveryPlaybook, now = new Date()): RecoveryIncident {
  const needBy = new Date(now.getTime() + 36 * 60 * 60 * 1_000);
  const lineStop = new Date(now.getTime() + 47 * 60 * 60 * 1_000);
  return {
    ...playbook.incident,
    lineStopAt: lineStop.toISOString(),
    requirements: {
      ...playbook.incident.requirements,
      needBy: needBy.toISOString().slice(0, 10),
    },
  };
}
