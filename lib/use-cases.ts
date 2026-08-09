export interface CommercialUseCase {
  slug: string;
  sector: string;
  audience: string;
  title: string;
  headline: string;
  situation: string;
  commitment: string;
  proofFields: string[];
  value: string;
  adHeadline: string;
  adBody: string;
  initial: boolean;
}

export const COMMERCIAL_USE_CASES: CommercialUseCase[] = [
  {
    slug: "manufacturing-line-stop",
    sector: "Manufacturing",
    audience: "Plant buyers · Materials planners · Procurement",
    title: "Line-stop recovery",
    headline: "The line stops next. Know which approved supplier can truly commit before it does.",
    situation: "An incumbent reports a capacity, quality, tooling, or logistics failure against a critical production part.",
    commitment: "Exact or approved part, releasable quantity, ship date, unit price, origin, certifications, quote validity, and respondent authority.",
    proofFields: ["Part and substitute", "Quantity", "Ship date", "Price", "Origin", "Certifications", "Authority", "Transcript evidence"],
    value: "Replace the improvised buyer call tree with one comparable, reviewable recovery decision.",
    adHeadline: "The line stops Friday. Which supplier can commit by Wednesday?",
    adBody: "Reach approved backups in parallel and return one policy-qualified fallback with transcript evidence.",
    initial: true,
  },
  {
    slug: "maintenance-mro",
    sector: "Maintenance & MRO",
    audience: "Maintenance leaders · Reliability teams · MRO buyers",
    title: "Critical spare recovery",
    headline: "The asset is down. Verify the right spare, ETA, and authority before dispatch.",
    situation: "A production asset or field installation is offline and the normal spare is unavailable or late.",
    commitment: "Compatible part or revision, condition, available quantity, dispatch time, delivery method, warranty, and authorized release contact.",
    proofFields: ["Compatibility", "Condition", "Quantity", "Dispatch time", "Delivery", "Warranty", "Authority", "Evidence"],
    value: "Shorten the gap between finding a possible spare and knowing it is a usable recovery option.",
    adHeadline: "An asset is down. A directory is not a commitment.",
    adBody: "Turn known MRO vendors into comparable, evidence-backed dispatch options without another phone tree.",
    initial: true,
  },
  {
    slug: "construction-materials",
    sector: "Construction",
    audience: "Project managers · Site procurement · General contractors",
    title: "Site-critical material recovery",
    headline: "Tomorrow’s work package should not wait for six disconnected vendor calls.",
    situation: "Concrete, steel, equipment, or a specified material slips against a critical path activity.",
    commitment: "Specification, available volume, delivery slot, site access constraints, price, compliance documents, and dispatcher authority.",
    proofFields: ["Specification", "Volume", "Delivery slot", "Site constraints", "Price", "Documents", "Authority", "Evidence"],
    value: "Give the project manager a qualified replacement option before the delay becomes a schedule claim.",
    adHeadline: "The pour is tomorrow. Recover the material without losing the spec.",
    adBody: "Verify local suppliers against the job’s exact quantity, slot, documentation, and price guardrails.",
    initial: true,
  },
  {
    slug: "food-packaging",
    sector: "Food & CPG",
    audience: "Supply planners · Packaging buyers · Plant operations",
    title: "Ingredient and packaging recovery",
    headline: "Protect the production run without relaxing food-safety or packaging requirements.",
    situation: "A packaging, ingredient, or co-manufacturing allocation slips just before a scheduled run.",
    commitment: "Approved material, lot quantity, ship date, allergen or food-safety documents, origin, shelf life, price, and release authority.",
    proofFields: ["Material", "Lot quantity", "Ship date", "Food-safety docs", "Origin", "Shelf life", "Authority", "Evidence"],
    value: "Recover an allocation while keeping non-negotiable quality fields visible and deterministic.",
    adHeadline: "A packaging supplier slips. Recover the run—not just a callback.",
    adBody: "Compare real allocations and block an attractive offer when required safety evidence is missing.",
    initial: true,
  },
  {
    slug: "logistics-capacity",
    sector: "Logistics",
    audience: "Transportation planners · 3PL operations · Shippers",
    title: "Carrier capacity recovery",
    headline: "A carrier cancels. Secure verified capacity before the dock window closes.",
    situation: "A booked lane fails, a spot movement becomes urgent, or a time-critical shipment needs replacement capacity.",
    commitment: "Equipment type, pickup window, delivery promise, lane, rate, insurance or permit status, and dispatcher authority.",
    proofFields: ["Equipment", "Pickup", "Delivery", "Lane", "Rate", "Permits", "Authority", "Evidence"],
    value: "Turn phone-only carrier availability into a comparable handoff for transportation control.",
    adHeadline: "A carrier canceled. Secure a verified truck, not another voicemail.",
    adBody: "Contact approved carriers in parallel and return the first option that clears every lane and policy constraint.",
    initial: true,
  },
  {
    slug: "retail-replenishment",
    sector: "Retail & Wholesale",
    audience: "Inventory planners · Wholesalers · Multi-site operators",
    title: "Stockout replenishment",
    headline: "When a fast-moving item breaks plan, recover a real allocation across your known vendors.",
    situation: "A promotion, seasonal spike, or supplier miss creates an urgent replenishment gap across stores or customer orders.",
    commitment: "SKU or approved substitute, available cases, ship-from location, dispatch date, landed price, shelf or handling constraints, and authority.",
    proofFields: ["SKU", "Cases", "Ship-from", "Dispatch", "Landed price", "Handling", "Authority", "Evidence"],
    value: "Give a lean team an exception workflow without requiring a full procurement transformation.",
    adHeadline: "No procurement suite. No call tree. One controlled stockout recovery.",
    adBody: "Start from a CSV or approved contact list and return a decision-ready replenishment option.",
    initial: true,
  },
  {
    slug: "utility-restoration",
    sector: "Energy & Utilities",
    audience: "Supply chain response · Field operations · Emergency procurement",
    title: "Restoration material recovery",
    headline: "Verify restoration stock and dispatch conditions while human incident command stays in control.",
    situation: "A storm, outage, or field failure creates an urgent requirement for approved repair materials or contractor capacity.",
    commitment: "Approved specification, stock, dispatch window, destination, credentials, price basis, and authorized responder.",
    proofFields: ["Specification", "Stock", "Dispatch", "Destination", "Credentials", "Price basis", "Authority", "Evidence"],
    value: "Add structured supplier evidence to incident response without automating the final operational decision.",
    adHeadline: "Restoration needs commitments, not contact attempts.",
    adBody: "Verify approved vendors against the incident brief while field and procurement leaders retain authority.",
    initial: false,
  },
  {
    slug: "healthcare-supplies",
    sector: "Healthcare supply",
    audience: "Hospital supply chain · Pharmacy operations · Clinical logistics",
    title: "Critical supply escalation",
    headline: "Escalate known suppliers and preserve the evidence—without delegating clinical judgment.",
    situation: "A critical supply is constrained and authorized supply-chain staff need current allocation facts from established vendors.",
    commitment: "Exact approved item, allocation, expiry, delivery, regulatory documentation, price, and authorized supplier representative.",
    proofFields: ["Approved item", "Allocation", "Expiry", "Delivery", "Regulatory docs", "Price", "Authority", "Evidence"],
    value: "Support supply-chain escalation while keeping clinical, regulatory, and purchasing decisions outside the agent.",
    adHeadline: "Critical supply escalation with evidence and human authority.",
    adBody: "A future controlled deployment for established vendors—not clinical advice, emergency dispatch, or autonomous purchasing.",
    initial: false,
  },
];

export function getCommercialUseCase(slug: string) {
  return COMMERCIAL_USE_CASES.find((useCase) => useCase.slug === slug);
}
