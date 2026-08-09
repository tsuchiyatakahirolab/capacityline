"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Ban,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FilePenLine,
  Gauge,
  Headphones,
  History,
  LayoutDashboard,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  Network,
  PhoneCall,
  Play,
  Radio,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildDemoCommitments,
  DEMO_INCIDENT,
  DEMO_REVEAL_ORDER,
  DEMO_SUPPLIERS,
} from "@/lib/demo-data";
import { evaluateCommitment } from "@/lib/evaluate";
import { validateRecoveryIncident } from "@/lib/incident";
import { normalizeCalleCommitment } from "@/lib/normalize";
import { E164_PATTERN } from "@/lib/phone";
import {
  DEFAULT_PLAYBOOK,
  getRecoveryPlaybook,
  materializePlaybookIncident,
  RECOVERY_PLAYBOOKS,
} from "@/lib/recovery-playbooks";
import { buildCommitmentCsv, buildRecoveryDossier } from "@/lib/recovery-dossier";
import type {
  LiveRecipient,
  RecoveryIncident,
  Supplier,
  SupplierCommitment,
  SupplierEvaluation,
  SupplierStatus,
} from "@/lib/types";

type View = "desk" | "ledger" | "graph";
type Phase = "ready" | "running" | "complete" | "approved";
type LaunchMode = "demo" | "live";

interface CalleRecipientResult {
  status?: string;
  structuredResult?: unknown;
  attempts?: Array<{ transcriptTurns?: unknown }>;
}

interface CalleCallResult {
  id: string;
  status: string;
  completionConfidence?: unknown;
  recipients?: CalleRecipientResult[];
}

const STATUS_COPY: Record<SupplierStatus, string> = {
  ready: "Ready",
  calling: "Calling",
  qualified: "Qualified",
  review: "Review",
  ineligible: "Ineligible",
  unreachable: "No answer",
};

const STATUS_ICON: Record<SupplierStatus, React.ReactNode> = {
  ready: <Clock3 size={13} />,
  calling: <LoaderCircle size={13} className="spin" />,
  qualified: <CheckCircle2 size={13} />,
  review: <AlertTriangle size={13} />,
  ineligible: <XCircle size={13} />,
  unreachable: <PhoneCall size={13} />,
};

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLatency(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return formatDuration(Math.round(seconds));
}

function csvList(value: FormDataEntryValue | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function formatDate(value: string | null) {
  if (!value) return "Not confirmed";
  const date = new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function StatusBadge({ status }: { status: SupplierStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {STATUS_ICON[status]}
      {STATUS_COPY[status]}
    </span>
  );
}

function Countdown({ target }: { target: string }) {
  const calculateRemaining = useCallback(
    () => Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1_000)),
    [target],
  );
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const firstUpdate = window.setTimeout(() => setRemaining(calculateRemaining()), 0);
    const timer = window.setInterval(() => setRemaining(calculateRemaining()), 1_000);
    return () => {
      window.clearTimeout(firstUpdate);
      window.clearInterval(timer);
    };
  }, [calculateRemaining]);

  if (remaining === null) return <span className="countdown-value">--:--:--</span>;

  const hours = Math.floor(remaining / 3_600);
  const minutes = Math.floor((remaining % 3_600) / 60);
  const seconds = remaining % 60;
  return (
    <span className="countdown-value">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </span>
  );
}

function formatLineStop(value: string, timeZone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(date);
}

export function CapacityLineApp() {
  const [view, setView] = useState<View>("desk");
  const [phase, setPhase] = useState<Phase>("ready");
  const [incident, setIncident] = useState<RecoveryIncident>(DEMO_INCIDENT);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => DEMO_SUPPLIERS.map((item) => ({ ...item })));
  const [commitments, setCommitments] = useState<Record<string, SupplierCommitment | null | undefined>>({});
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [approvedSupplierId, setApprovedSupplierId] = useState<string | null>(null);
  const [showLaunch, setShowLaunch] = useState(false);
  const [launchMode, setLaunchMode] = useState<LaunchMode>("demo");
  const [liveReady, setLiveReady] = useState(false);
  const [allowListEnabled, setAllowListEnabled] = useState(false);
  const [livePhones, setLivePhones] = useState<Record<string, string>>({});
  const [liveSupplierNames, setLiveSupplierNames] = useState<Record<string, string>>(() => Object.fromEntries(DEMO_SUPPLIERS.map((supplier) => [supplier.id, supplier.name])));
  const [liveRegions, setLiveRegions] = useState<Record<string, string>>(() => Object.fromEntries(DEMO_SUPPLIERS.map((supplier) => [supplier.id, supplier.countryCode])));
  const [liveLocales, setLiveLocales] = useState<Record<string, string>>(() => Object.fromEntries(DEMO_SUPPLIERS.map((supplier) => [supplier.id, supplier.locale])));
  const [authorized, setAuthorized] = useState(false);
  const [operationalPurposeConfirmed, setOperationalPurposeConfirmed] = useState(false);
  const [relationshipConfirmed, setRelationshipConfirmed] = useState(false);
  const [jurisdictionReviewed, setJurisdictionReviewed] = useState(false);
  const [disclosureScriptApproved, setDisclosureScriptApproved] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [consentReference, setConsentReference] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [liveSupplierIds, setLiveSupplierIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const [query, setQuery] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [showPlaybooks, setShowPlaybooks] = useState(false);
  const [playbookId, setPlaybookId] = useState(DEFAULT_PLAYBOOK.id);
  const [runMode, setRunMode] = useState<LaunchMode>("demo");
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [decisionReadyAt, setDecisionReadyAt] = useState<number | null>(null);
  const [authorityRecord, setAuthorityRecord] = useState<{ operatorName: string; consentReference: string } | null>(null);
  const timers = useRef<number[]>([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const timingInitialized = useRef(false);

  const activePlaybook = getRecoveryPlaybook(playbookId);

  useEffect(() => {
    if (timingInitialized.current) return;
    timingInitialized.current = true;
    setIncident(materializePlaybookIncident(DEFAULT_PLAYBOOK));
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data: { liveReady?: boolean; allowListEnabled?: boolean }) => {
        setLiveReady(Boolean(data.liveReady));
        setAllowListEnabled(Boolean(data.allowListEnabled));
      })
      .catch(() => setLiveReady(false));
  }, []);

  const scenarioCommitments = useMemo(() => buildDemoCommitments(incident), [incident]);

  const evaluations = useMemo(() => {
    const result: Record<string, SupplierEvaluation> = {};
    for (const supplier of suppliers) {
      if (supplier.id in commitments) {
        result[supplier.id] = evaluateCommitment(
          incident.requirements,
          commitments[supplier.id] ?? null,
          supplier.id,
        );
      }
    }
    return result;
  }, [commitments, incident.requirements, suppliers]);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null;
  const selectedCommitment = selectedSupplierId ? commitments[selectedSupplierId] : undefined;
  const selectedEvaluation = selectedSupplierId ? evaluations[selectedSupplierId] : undefined;
  const qualifiedCount = suppliers.filter((supplier) => supplier.status === "qualified").length;
  const completedCount = suppliers.filter((supplier) => !["ready", "calling"].includes(supplier.status)).length;
  const filteredSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return suppliers;
    return suppliers.filter((supplier) =>
      [supplier.name, supplier.location, supplier.countryCode, supplier.approvalTier].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query, suppliers]);
  const recommendedSupplier = useMemo(() => {
    return suppliers
      .filter((supplier) => supplier.status === "qualified")
      .sort((left, right) => {
        const leftCommitment = commitments[left.id];
        const rightCommitment = commitments[right.id];
        const exactPartDelta =
          Number(rightCommitment?.substitutePart === incident.partNumber) -
          Number(leftCommitment?.substitutePart === incident.partNumber);
        if (exactPartDelta) return exactPartDelta;
        const dateDelta = (leftCommitment?.earliestShipDate ?? "9999").localeCompare(
          rightCommitment?.earliestShipDate ?? "9999",
        );
        return dateDelta || right.historicalReliability - left.historicalReliability;
      })[0];
  }, [commitments, incident.partNumber, suppliers]);
  const recommendedCommitment = recommendedSupplier ? commitments[recommendedSupplier.id] : undefined;
  const blockedSupplier = suppliers.find((supplier) => supplier.status === "ineligible");
  const blockedCommitment = blockedSupplier ? commitments[blockedSupplier.id] : undefined;
  const answeredCount = Object.values(commitments).filter(Boolean).length;
  const traceableCount = Object.values(commitments).filter(
    (commitment) => commitment?.evidenceQuote && commitment.transcript.length > 0,
  ).length;
  const traceabilityPercent = answeredCount ? Math.round((traceableCount / answeredCount) * 100) : 0;
  const decisionLatencySeconds = runStartedAt && decisionReadyAt
    ? Math.max(0, (decisionReadyAt - runStartedAt) / 1_000)
    : null;

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if (event.key === "Escape") {
        setShowLaunch(false);
        setShowGuide(false);
        setShowBrief(false);
        setShowPlaybooks(false);
        setSelectedSupplierId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateSupplierStatus = useCallback((supplierId: string, status: SupplierStatus) => {
    setSuppliers((current) =>
      current.map((supplier) => (supplier.id === supplierId ? { ...supplier, status } : supplier)),
    );
  }, []);

  const revealCommitment = useCallback(
    (supplierId: string, commitment: SupplierCommitment | null) => {
      setCommitments((current) => ({ ...current, [supplierId]: commitment }));
      const evaluation = evaluateCommitment(incident.requirements, commitment, supplierId);
      updateSupplierStatus(supplierId, evaluation.disposition);
      setRevealCount((count) => count + 1);
    },
    [incident.requirements, updateSupplierStatus],
  );

  const resetRun = useCallback((roster: Supplier[]) => {
    clearTimers();
    setPhase("ready");
    setSuppliers(roster.map((item) => ({ ...item, status: "ready" })));
    setCommitments({});
    setSelectedSupplierId(null);
    setApprovedSupplierId(null);
    setActiveCallId(null);
    setLiveSupplierIds([]);
    setRevealCount(0);
    setError(null);
    setRunStartedAt(null);
    setDecisionReadyAt(null);
    setAuthorityRecord(null);
  }, [clearTimers]);

  const reset = useCallback(() => {
    resetRun(activePlaybook.suppliers);
  }, [activePlaybook.suppliers, resetRun]);

  function applyPlaybook(playbookIdToApply: string) {
    const playbook = getRecoveryPlaybook(playbookIdToApply);
    resetRun(playbook.suppliers);
    setPlaybookId(playbook.id);
    setIncident(materializePlaybookIncident(playbook));
    setLiveSupplierNames(Object.fromEntries(playbook.suppliers.map((supplier) => [supplier.id, supplier.name])));
    setLiveRegions(Object.fromEntries(playbook.suppliers.map((supplier) => [supplier.id, supplier.countryCode])));
    setLiveLocales(Object.fromEntries(playbook.suppliers.map((supplier) => [supplier.id, supplier.locale])));
    setView("desk");
    setShowPlaybooks(false);
  }

  async function runDemo() {
    setError(null);
    setShowLaunch(false);
    setPhase("running");
    setRunMode("demo");
    setRunStartedAt(Date.now());
    setDecisionReadyAt(null);
    setSuppliers((current) => current.map((supplier) => ({ ...supplier, status: "calling" })));
    try {
      await fetch("/api/calls/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo" }),
      });
    } catch {
      // The deterministic browser demo remains usable if the local API is temporarily unavailable.
    }

    DEMO_REVEAL_ORDER.forEach((supplierId, index) => {
      const timer = window.setTimeout(
        () => revealCommitment(supplierId, scenarioCommitments[supplierId] ?? null),
        900 + index * 850,
      );
      timers.current.push(timer);
    });
    timers.current.push(
      window.setTimeout(() => {
        setPhase("complete");
        setDecisionReadyAt(Date.now());
        setSelectedSupplierId("sup-kanto");
      }, 900 + DEMO_REVEAL_ORDER.length * 850),
    );
  }

  async function runLive() {
    const chosen = suppliers.filter((supplier) => livePhones[supplier.id]?.trim());
    if (!liveReady) {
      setError("Live calling is not enabled for this workspace.");
      return;
    }
    if (chosen.length === 0) {
      setError("Enter at least one authorized E.164 phone number.");
      return;
    }
    if (chosen.some((supplier) => !E164_PATTERN.test(livePhones[supplier.id].trim()))) {
      setError("Live phone numbers must use E.164 format, for example +14155550100.");
      return;
    }
    if (chosen.some((supplier) => !liveSupplierNames[supplier.id]?.trim())) {
      setError("Enter a supplier name for every live recipient.");
      return;
    }
    if (chosen.some((supplier) => !/^[A-Z]{2}$/.test((liveRegions[supplier.id] ?? "").trim().toUpperCase()))) {
      setError("Live recipient regions must use two-letter ISO country codes.");
      return;
    }
    if (chosen.some((supplier) => !/^[a-z]{2}(?:-[A-Z]{2})?$/.test((liveLocales[supplier.id] ?? "").trim()))) {
      setError("Live recipient locales must look like en-US or en.");
      return;
    }
    if (!operatorName.trim() || !consentReference.trim()) {
      setError("Record the responsible operator and a consent or authorization reference.");
      return;
    }
    if (!authorized || !operationalPurposeConfirmed || !relationshipConfirmed || !jurisdictionReviewed || !disclosureScriptApproved) {
      setError("Complete every live-operation authority and jurisdiction confirmation.");
      return;
    }
    if (confirmation !== "AUTHORIZE SUPPLIER RECOVERY") {
      setError("Type AUTHORIZE SUPPLIER RECOVERY exactly to continue.");
      return;
    }

    const recipients: LiveRecipient[] = chosen.map((supplier) => ({
      supplierId: supplier.id,
      supplierName: liveSupplierNames[supplier.id].trim(),
      phone: livePhones[supplier.id].trim(),
      region: liveRegions[supplier.id].trim().toUpperCase(),
      locale: liveLocales[supplier.id].trim(),
    }));

    setError(null);
    setPhase("running");
    setRunMode("live");
    setRunStartedAt(Date.now());
    setDecisionReadyAt(null);
    setShowLaunch(false);
    setSuppliers((current) =>
      current.map((supplier) => ({
        ...supplier,
        name: recipients.find((recipient) => recipient.supplierId === supplier.id)?.supplierName ?? supplier.name,
        countryCode: recipients.find((recipient) => recipient.supplierId === supplier.id)?.region ?? supplier.countryCode,
        locale: recipients.find((recipient) => recipient.supplierId === supplier.id)?.locale ?? supplier.locale,
        status: recipients.some((recipient) => recipient.supplierId === supplier.id) ? "calling" : "ready",
      })),
    );

    try {
      const response = await fetch("/api/calls/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "live",
          recipients,
          authorized: true,
          confirmation,
          runKey: crypto.randomUUID(),
          incident,
          compliance: {
            purpose: "supplier_capacity_verification",
            operatorName: operatorName.trim(),
            consentReference: consentReference.trim(),
            operationalPurposeConfirmed: true,
            existingBusinessRelationship: true,
            priorExpressConsent: true,
            jurisdictionAndCallingWindowReviewed: true,
            disclosureScriptApproved: true,
          },
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        call?: CalleCallResult;
        supplierIds?: string[];
      };
      if (!response.ok || !data.call) throw new Error(data.error || "CALL-E did not return a call task.");
      setActiveCallId(data.call.id);
      setLiveSupplierIds(data.supplierIds ?? recipients.map((recipient) => recipient.supplierId));
      setAuthorityRecord({ operatorName: operatorName.trim(), consentReference: consentReference.trim() });
    } catch (caught) {
      setPhase("ready");
      setSuppliers(activePlaybook.suppliers.map((item) => ({ ...item, status: "ready" })));
      setError(caught instanceof Error ? caught.message : "Unable to start live calls.");
    }
  }

  useEffect(() => {
    if (!activeCallId || liveSupplierIds.length === 0) return;
    let stopped = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/calls/${encodeURIComponent(activeCallId)}`, { cache: "no-store" });
        const data = (await response.json()) as { error?: string; call?: CalleCallResult };
        if (!response.ok || !data.call) throw new Error(data.error || "Unable to poll CALL-E.");
        const call = data.call;
        const terminal = ["completed", "failed", "cancelled", "canceled"].includes(call.status);
        if (terminal) {
          liveSupplierIds.forEach((supplierId, index) => {
            const recipient = call.recipients?.[index];
            const transcript = recipient?.attempts?.at(-1)?.transcriptTurns ?? [];
            const commitment = normalizeCalleCommitment(
              supplierId,
              recipient?.structuredResult,
              transcript,
              call.completionConfidence,
            );
            revealCommitment(supplierId, commitment);
          });
          setPhase("complete");
          setDecisionReadyAt(Date.now());
          setActiveCallId(null);
          return;
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Live status polling failed.");
      }
      if (!stopped) window.setTimeout(poll, 7_000);
    };

    const firstPoll = window.setTimeout(poll, 5_000);
    return () => {
      stopped = true;
      window.clearTimeout(firstPoll);
    };
  }, [activeCallId, liveSupplierIds, revealCommitment]);

  function approveSupplier(supplierId: string) {
    if (evaluations[supplierId]?.disposition !== "qualified") return;
    setApprovedSupplierId(supplierId);
    setPhase("approved");
    setSelectedSupplierId(null);
  }

  function applyIncidentBrief(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const needBy = String(form.get("needBy") ?? "");
    const lineStopLocal = String(form.get("lineStopAt") ?? "");
    const candidate: RecoveryIncident = {
      ...incident,
      title: `${String(form.get("partName") ?? "").trim()} supply interruption`,
      cause: String(form.get("cause") ?? ""),
      buyerOrganization: String(form.get("buyerOrganization") ?? ""),
      plant: String(form.get("plant") ?? ""),
      plantTimeZone: String(form.get("plantTimeZone") ?? ""),
      productionLine: String(form.get("productionLine") ?? ""),
      partNumber: String(form.get("partNumber") ?? ""),
      partName: String(form.get("partName") ?? ""),
      incumbentSupplier: String(form.get("incumbentSupplier") ?? ""),
      shortfall: Number(form.get("shortfall")),
      quantityUnit: String(form.get("quantityUnit") ?? ""),
      lineStopAt: lineStopLocal || `${needBy}T09:30:00Z`,
      estimatedDowntimeCost: Number(form.get("estimatedDowntimeCost")),
      requirements: {
        quantity: Number(form.get("shortfall")),
        needBy,
        maxUnitPrice: Number(form.get("maxUnitPrice")),
        currency: String(form.get("currency") ?? ""),
        requiredCertifications: csvList(form.get("requiredCertifications")),
        allowedOrigins: csvList(form.get("allowedOrigins")).map((item) => item.toUpperCase()),
        approvedSubstituteParts: csvList(form.get("approvedSubstituteParts")),
      },
    };
    const result = validateRecoveryIncident(candidate);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    reset();
    setIncident(result.value);
    setShowBrief(false);
  }

  function restoreReferenceBrief() {
    applyPlaybook(DEFAULT_PLAYBOOK.id);
  }

  function exportEvidence(format: "json" | "csv") {
    if (completedCount === 0) return;
    const input = {
      incident,
      suppliers,
      commitments,
      evaluations,
      approvedSupplierId,
      decisionLatencySeconds,
      runMode,
      authorityRecord,
    } as const;
    const content = format === "json"
      ? JSON.stringify(buildRecoveryDossier(input), null, 2)
      : buildCommitmentCsv(input);
    const blob = new Blob([content], {
      type: format === "json" ? "application/json;charset=utf-8" : "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${incident.id.replace(/[^a-zA-Z0-9_-]/g, "-")}-evidence-pack.${format}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const activityItems = [
    { time: "09:31", title: "Supply exception opened", detail: `${incident.shortfall.toLocaleString()} ${incident.quantityUnit} short against ${incident.productionLine}`, tone: "danger" },
    ...(phase !== "ready"
      ? [{ time: "09:32", title: "Recovery simulation launched", detail: "Five approved supplier outcomes started in parallel", tone: "active" }]
      : []),
    ...(revealCount > 0
      ? [{ time: "09:36", title: "Sample responses returned", detail: `${completedCount} commitments include supporting evidence`, tone: "active" }]
      : []),
    ...(qualifiedCount > 0
      ? [{ time: "09:44", title: "Qualified fallback found", detail: "All eight procurement guardrails passed", tone: "success" }]
      : []),
    ...(phase === "approved"
      ? [{ time: "09:47", title: "RFQ handoff approved", detail: `${suppliers.find((item) => item.id === approvedSupplierId)?.name} sent to buyer workflow`, tone: "success" }]
      : []),
  ];

  const recoverySteps = [
    {
      label: "Detect",
      detail: "Exception opened",
      icon: <AlertTriangle size={16} />,
      state: "complete",
    },
    {
      label: "Call",
      detail: phase === "ready" ? "5 backups queued" : phase === "running" ? "Simulation running" : "5 attempts closed",
      icon: <Radio size={16} />,
      state: phase === "ready" ? "pending" : phase === "running" ? "active" : "complete",
    },
    {
      label: "Verify",
      detail: phase === "ready" ? "8 rules waiting" : phase === "running" ? `${completedCount}/5 evaluated` : `${qualifiedCount} qualified`,
      icon: <ShieldCheck size={16} />,
      state: phase === "ready" ? "pending" : phase === "running" ? "active" : "complete",
    },
    {
      label: "Decide",
      detail: phase === "approved" ? "RFQ handoff approved" : recommendedSupplier ? "Buyer review ready" : "Human authority",
      icon: <BookOpenCheck size={16} />,
      state: phase === "approved" ? "complete" : recommendedSupplier ? "active" : "pending",
    },
  ];

  const trackPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!shell.current) return;
    shell.current.style.setProperty("--pointer-x", `${event.clientX}px`);
    shell.current.style.setProperty("--pointer-y", `${event.clientY}px`);
  }, []);

  return (
    <div
      className="app-shell"
      data-phase={phase}
      data-view={view}
      onPointerMove={trackPointer}
      ref={shell}
    >
      <div className="kinetic-atmosphere" aria-hidden="true">
        <i className="atmosphere-grid" />
        <i className="atmosphere-glow" />
      </div>
      <aside className="sidebar">
        <Link className="brand-lockup" href="/" aria-label="CapacityLine home">
          <div className="brand-mark"><span /><span /><span /></div>
          <div>
            <strong>CapacityLine</strong>
            <small>SUPPLY RECOVERY</small>
          </div>
        </Link>

        <nav className="nav-list" aria-label="Primary navigation">
          <button className={view === "desk" ? "active" : ""} onClick={() => setView("desk")}>
            <LayoutDashboard size={18} /> Recovery desk
          </button>
          <button className={view === "ledger" ? "active" : ""} onClick={() => setView("ledger")}>
            <Database size={18} /> Commitment ledger
            {completedCount > 0 && <span className="nav-count">{completedCount}</span>}
          </button>
          <button className={view === "graph" ? "active" : ""} onClick={() => setView("graph")}>
            <Network size={18} /> Supplier graph
          </button>
        </nav>

        <div className="sidebar-label">ACTIVE INCIDENT</div>
        <button className="incident-mini" onClick={() => setView("desk")}>
          <span className="severity-dot" />
          <span>
            <strong>{incident.partNumber}</strong>
            <small>Stop: {formatDate(incident.requirements.needBy)}</small>
          </span>
          <ChevronRight size={16} />
        </button>

        <div className="sidebar-spacer" />
        <div className="provider-card">
          <div><Zap size={15} fill="currentColor" /> Powered by CALL-E</div>
          <p>Goal-driven parallel calls with structured results and transcript evidence.</p>
          <span className="connection-state"><i /> Sandbox · no calls</span>
        </div>
        <div className="profile-chip">
          <div className="avatar">CL</div>
          <div><strong>Recovery workspace</strong><small>Recovery operator</small></div>
        </div>
      </aside>

      <main className="main-content">
        <div className="signal-ticker" aria-hidden="true">
          <div className="signal-ticker-track">
            {[0, 1].map((copy) => (
              <div className="signal-ticker-set" key={copy}>
                <span><i /> INCIDENT {incident.id}</span>
                <span>{incident.shortfall.toLocaleString()} {incident.quantityUnit.toUpperCase()} SHORT</span>
                <span>{incident.plant.toUpperCase()} / {incident.productionLine.toUpperCase()}</span>
                <span>{phase === "ready" ? "SANDBOX READY" : phase === "running" ? "RECOVERY SIMULATION RUNNING" : "DECISION RECORD READY"}</span>
                <span>HUMAN AUTHORITY REQUIRED</span>
              </div>
            ))}
          </div>
        </div>
        <header className="topbar">
          <div>
            <div className="eyebrow">{incident.plant.toUpperCase()} / RECOVERY WORKSPACE</div>
            <h1>{view === "desk" ? "Recovery desk" : view === "ledger" ? "Commitment ledger" : "Supplier graph"}</h1>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input
                ref={searchInput}
                aria-label="Search suppliers"
                placeholder="Search suppliers"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>
              ) : <kbd>Ctrl K</kbd>}
            </label>
            <button className="guide-button brief-button" onClick={() => setShowBrief(true)}><FilePenLine size={14} /> Recovery brief</button>
            <button className="guide-button" onClick={() => setShowPlaybooks(true)}><Layers3 size={14} /> Playbooks</button>
            <button className="guide-button" onClick={() => setShowGuide(true)}><Route size={14} /> Quick tour</button>
            <a className="pilot-button" href="/pilot"><LockKeyhole size={14} /> Private pilot</a>
            <div className="demo-chip"><Sparkles size={14} /> Safe simulation</div>
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <AlertTriangle size={17} />
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error"><X size={16} /></button>
          </div>
        )}

        {view === "desk" && (
          <div className="page-stack">
            <section className="playbook-bar" aria-label="Active recovery playbook">
              <div>
                <span><Layers3 size={14} /> ACTIVE PLAYBOOK / {activePlaybook.sector}</span>
                <strong>{activePlaybook.label}</strong>
                <p>{activePlaybook.promise}</p>
              </div>
              <button onClick={() => setShowPlaybooks(true)}>Switch use case <ArrowRight size={14} /></button>
            </section>
            <section className="incident-hero">
              <div className="incident-copy">
                <div className="hero-badges">
                  <span className="critical-badge">CRITICAL</span>
                  <span>{incident.id}</span>
                  <span>Opened 4 min ago</span>
                </div>
                <h2><span>Recover supply.</span><em>Before the line stops.</em></h2>
                <p>
                  {incident.cause}. Verify live capacity across approved backups and surface the first actionable fallback.
                </p>
                <div className="incident-facts">
                  <span><Building2 size={15} /> {incident.productionLine}</span>
                  <span><Target size={15} /> {incident.shortfall.toLocaleString()} {incident.quantityUnit} short</span>
                  <span><CircleDollarSign size={15} /> {formatMoney(incident.estimatedDowntimeCost)} / day at risk</span>
                </div>
              </div>
              <div className="countdown-card">
                <div className="radar-stage" aria-hidden="true">
                  <i className="radar-ring radar-ring-one" />
                  <i className="radar-ring radar-ring-two" />
                  <i className="radar-ring radar-ring-three" />
                  <i className="radar-crosshair horizontal" />
                  <i className="radar-crosshair vertical" />
                  <i className="radar-sweep" />
                  <span className="radar-core"><PhoneCall size={19} /></span>
                  {suppliers.map((supplier, index) => (
                    <span className={`radar-node radar-node-${index + 1} radar-${supplier.status}`} key={supplier.id}>
                      <i />{supplier.countryCode}
                    </span>
                  ))}
                </div>
                <div className="countdown-panel">
                  <span>TIME UNTIL LINE STOP</span>
                  <Countdown key={incident.lineStopAt} target={incident.lineStopAt} />
                  <small>{formatLineStop(incident.lineStopAt, incident.plantTimeZone)}</small>
                  {phase === "ready" ? (
                    <button className="primary-button" onClick={() => setShowLaunch(true)}>
                      <Play size={16} fill="currentColor" /> Run recovery simulation
                    </button>
                  ) : (
                    <button className="secondary-button inverse" onClick={reset}>
                      <RotateCcw size={15} /> Reset scenario
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="recovery-flow" aria-label="Recovery workflow progress">
              <div className="flow-intro">
                <span className="panel-kicker">RECOVERY CONTROL LOOP</span>
                <strong>Conversation becomes a governed decision.</strong>
              </div>
              <div className="flow-steps" aria-live="polite">
                {recoverySteps.map((step, index) => (
                  <article
                    className={`flow-step flow-${step.state}`}
                    key={step.label}
                    aria-current={step.state === "active" ? "step" : undefined}
                  >
                    <span className="flow-icon">{step.state === "complete" ? <Check size={15} /> : step.icon}</span>
                    <div><small>0{index + 1}</small><strong>{step.label}</strong><span>{step.detail}</span></div>
                    {index < recoverySteps.length - 1 && <ArrowRight size={14} className="flow-arrow" />}
                  </article>
                ))}
              </div>
            </section>

            {phase === "approved" && (
              <section className="approval-banner">
                <div className="approval-icon"><FileCheck2 size={22} /></div>
                <div>
                  <strong>Buyer handoff approved</strong>
                  <p>{suppliers.find((supplier) => supplier.id === approvedSupplierId)?.name} is ready for RFQ creation. CapacityLine has not placed an order.</p>
                </div>
                <div className="approval-actions">
                  <span><Check size={15} /> Human-controlled</span>
                  <button onClick={() => exportEvidence("json")}><Download size={14} /> Evidence Pack</button>
                  <button onClick={() => exportEvidence("csv")}><Download size={14} /> CSV matrix</button>
                </div>
              </section>
            )}

            {recommendedSupplier && recommendedCommitment && (
              <section className="decision-spotlight">
                <article className="recommended-path">
                  <div className="spotlight-topline">
                    <span><BadgeCheck size={15} /> ACTIONABLE FALLBACK</span><em>BEST MATCH</em>
                  </div>
                  <div className="spotlight-content">
                    <span className="country-code large">{recommendedSupplier.countryCode}</span>
                    <div className="spotlight-copy">
                      <h3>{recommendedSupplier.name}</h3>
                      <p>{recommendedCommitment.substitutePart === incident.partNumber ? "Exact part" : `Approved ${recommendedCommitment.substitutePart}`} · {recommendedCommitment.quantityAvailable?.toLocaleString()} {incident.quantityUnit} · ships {formatDate(recommendedCommitment.earliestShipDate)}</p>
                    </div>
                    <div className="spotlight-score"><strong>8/8</strong><span>guardrails</span></div>
                    <button className="primary-button" onClick={() => setSelectedSupplierId(recommendedSupplier.id)}>
                      Review evidence <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="evidence-ribbon"><ShieldCheck size={14} /> {Math.round(recommendedCommitment.confidence * 100)}% evidence confidence · respondent authority confirmed · no order placed</div>
                </article>
                {blockedSupplier && blockedCommitment && (
                  <button className="blocked-path" onClick={() => setSelectedSupplierId(blockedSupplier.id)}>
                    <span className="blocked-icon"><Ban size={17} /></span>
                    <span><small>POLICY CAUGHT THIS</small><strong>Low-price offer blocked</strong><em>{blockedSupplier.name} · {blockedCommitment.currency} {blockedCommitment.unitPrice?.toFixed(2)} · {evaluations[blockedSupplier.id]?.checks.find((check) => !check.passed && check.severity === "hard")?.label ?? "hard policy failure"}</em></span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </section>
            )}

            <section className="metric-grid">
              <article className="metric-card accent">
                <div className="metric-icon"><Gauge size={19} /></div>
                <div><span>TIME TO DECISION EVIDENCE</span><strong>{formatLatency(decisionLatencySeconds)}</strong></div>
                <small>{decisionLatencySeconds !== null ? `${runMode === "demo" ? "Measured simulation" : "Measured live run"} elapsed time` : "Clock starts at launch"}</small>
              </article>
              <article className="metric-card">
                <div className="metric-icon green"><BadgeCheck size={19} /></div>
                <div><span>QUALIFIED OPTIONS</span><strong>{qualifiedCount}<em> / {suppliers.length}</em></strong></div>
                <small>All hard guardrails passed</small>
              </article>
              <article className="metric-card">
                <div className="metric-icon amber"><Headphones size={19} /></div>
                <div><span>EVIDENCE TRACEABILITY</span><strong>{answeredCount ? `${traceabilityPercent}%` : "—"}</strong></div>
                <small>{answeredCount ? `${traceableCount}/${answeredCount} answered outcomes grounded` : "Waiting for supplier evidence"}</small>
              </article>
              <article className="metric-card">
                <div className="metric-icon blue"><CircleDollarSign size={19} /></div>
                <div><span>MODELED DAILY EXPOSURE</span><strong>{formatMoney(incident.estimatedDowntimeCost)}</strong></div>
                <small>Input assumption · not claimed savings</small>
              </article>
            </section>

            <section className="workspace-grid">
              <article className="panel supplier-panel">
                <div className="panel-header">
                  <div><span className="panel-kicker">SIMULATED PARALLEL OUTREACH</span><h3>Approved backup suppliers</h3></div>
                  <div className="panel-header-meta">
                    {phase === "running" && <span className="live-pill"><i /> SIMULATION</span>}
                    <span>{completedCount} of {suppliers.length} returned</span>
                  </div>
                </div>
                <div className="supplier-table-head">
                  <span>SUPPLIER</span><span>RELIABILITY</span><span>LIVE COMMITMENT</span><span>FIT</span><span />
                </div>
                <div className="supplier-list">
                  {filteredSuppliers.map((supplier) => {
                    const commitment = commitments[supplier.id];
                    const evaluation = evaluations[supplier.id];
                    return (
                      <button
                        className={`supplier-row ${supplier.status === "qualified" ? "row-qualified" : ""}`}
                        key={supplier.id}
                        onClick={() => supplier.status !== "ready" && setSelectedSupplierId(supplier.id)}
                      >
                        <span className="supplier-identity">
                          <span className="country-code">{supplier.countryCode}</span>
                          <span><strong>{supplier.name}{recommendedSupplier?.id === supplier.id && <em className="best-match-inline">Best</em>}</strong><small>{supplier.location} · {supplier.approvalTier}</small></span>
                        </span>
                        <span className="reliability-cell">
                          <span className="reliability-track"><i style={{ width: `${supplier.historicalReliability}%` }} /></span>
                          <small>{supplier.historicalReliability}%</small>
                        </span>
                        <span className="commitment-cell">
                          {supplier.status === "calling" ? (
                            <span className="calling-wave"><i /><i /><i /><i /><small>Commitment in progress</small></span>
                          ) : commitment ? (
                            <><strong>{commitment.quantityAvailable?.toLocaleString() ?? "—"} {incident.quantityUnit}</strong><small>{formatDate(commitment.earliestShipDate)} · {commitment.currency} {commitment.unitPrice?.toFixed(2) ?? "—"}</small></>
                          ) : supplier.status === "unreachable" ? (
                            <><strong>No answer</strong><small>Attempt closed safely</small></>
                          ) : (
                            <><strong>Awaiting launch</strong><small>{supplier.maskedPhone}</small></>
                          )}
                        </span>
                        <span className="fit-cell">
                          <StatusBadge status={supplier.status} />
                          {evaluation && <small>{evaluation.score}/100</small>}
                        </span>
                        <ChevronRight size={17} className="row-chevron" />
                      </button>
                    );
                  })}
                  {filteredSuppliers.length === 0 && (
                    <div className="search-empty"><Search size={18} /><span>No suppliers match “{query}”</span><button onClick={() => setQuery("")}>Clear search</button></div>
                  )}
                </div>
                <div className="table-footnote">
                  <ShieldCheck size={15} /> This simulation never contacts suppliers. Live operations require approved recipients, documented consent, and human authorization.
                </div>
              </article>

              <div className="right-rail">
                <article className="panel guardrail-panel">
                  <div className="panel-header compact">
                    <div><span className="panel-kicker">BUYER POLICY</span><h3>Qualification guardrails</h3></div>
                    <LockKeyhole size={17} />
                  </div>
                  <div className="guardrail-list">
                    <div><span>Quantity</span><strong>≥ {incident.requirements.quantity.toLocaleString()} {incident.quantityUnit}</strong></div>
                    <div><span>Ship no later than</span><strong>{formatDate(incident.requirements.needBy)}</strong></div>
                    <div><span>Unit price</span><strong>≤ {incident.requirements.currency} {incident.requirements.maxUnitPrice.toFixed(2)}</strong></div>
                    <div><span>Approved parts</span><strong>{incident.requirements.approvedSubstituteParts.join(" + ")}</strong></div>
                    <div><span>Certifications</span><strong>{incident.requirements.requiredCertifications.join(" + ")}</strong></div>
                    <div><span>Origin</span><strong>Approved countries only</strong></div>
                    <div><span>Decision authority</span><strong>Must be confirmed</strong></div>
                  </div>
                  <button className="text-button" onClick={() => setSelectedSupplierId(qualifiedCount ? "sup-kanto" : null)}>
                    Inspect buyer checks <ArrowRight size={14} />
                  </button>
                </article>

                <article className="panel activity-panel">
                  <div className="panel-header compact">
                    <div><span className="panel-kicker">AUDIT TRAIL</span><h3>Recovery activity</h3></div>
                    <History size={17} />
                  </div>
                  <div className="activity-list">
                    {activityItems.map((item) => (
                      <div className="activity-item" key={item.title}>
                        <time>{item.time}</time>
                        <i className={item.tone} />
                        <div><strong>{item.title}</strong><p>{item.detail}</p></div>
                      </div>
                    ))}
                    {phase === "running" && (
                      <div className="activity-item pending">
                        <time>NOW</time><i /><div><strong>Decision flow is running</strong><p>Five sample commitments resolve without creating a phone call</p></div>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            </section>
          </div>
        )}

        {view === "ledger" && (
          <LedgerView
            quantityUnit={incident.quantityUnit}
            suppliers={suppliers}
            commitments={commitments}
            evaluations={evaluations}
            recommendedId={recommendedSupplier?.id}
            onOpen={setSelectedSupplierId}
            onReturn={() => setView("desk")}
            onExport={exportEvidence}
          />
        )}

        {view === "graph" && <SupplierGraph incident={incident} suppliers={suppliers} commitments={commitments} recommendedId={recommendedSupplier?.id} />}
      </main>

      {showPlaybooks && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowPlaybooks(false)}>
          <section className="playbook-modal" role="dialog" aria-modal="true" aria-labelledby="playbook-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPlaybooks(false)} aria-label="Close recovery playbooks"><X size={18} /></button>
            <div className="playbook-modal-heading">
              <span className="modal-symbol"><Layers3 size={23} /></span>
              <div><span className="panel-kicker">RECOVERY PLAYBOOK LIBRARY</span><h2 id="playbook-title">One decision engine. Six operating contexts.</h2></div>
            </div>
            <p>Choose a sample scenario. CapacityLine changes the incident, supplier roster, quantity unit, policy, and evidence fields—while keeping the same governed recovery loop.</p>
            <div className="playbook-grid">
              {RECOVERY_PLAYBOOKS.map((playbook, index) => (
                <button
                  key={playbook.id}
                  className={playbook.id === playbookId ? "selected" : ""}
                  onClick={() => applyPlaybook(playbook.id)}
                >
                  <span>0{index + 1} / {playbook.sector}</span>
                  <strong>{playbook.label}</strong>
                  <p>{playbook.promise}</p>
                  <em>{playbook.id === playbookId ? "Active now" : "Load scenario"} <ArrowRight size={13} /></em>
                </button>
              ))}
            </div>
            <div className="playbook-proof"><ShieldCheck size={15} /><span>Sandbox playbooks use sample outcomes and make no calls. Live operations require approved recipients, disclosure, and human authorization.</span></div>
          </section>
        </div>
      )}

      {showBrief && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowBrief(false)}>
          <form className="brief-modal" role="dialog" aria-modal="true" aria-labelledby="brief-title" onSubmit={applyIncidentBrief} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowBrief(false)} aria-label="Close recovery brief"><X size={18} /></button>
            <div className="brief-heading">
              <span className="modal-symbol"><FilePenLine size={23} /></span>
              <div><span className="panel-kicker">OPERATIONAL INPUT</span><h2 id="brief-title">Define the recovery brief.</h2></div>
            </div>
            <p>These facts define the supplier outreach, the eight buyer guardrails, and the exported decision record. The simulation uses sample results and makes no calls.</p>
            <div className="brief-grid">
              <label><span>Buyer organization</span><input name="buyerOrganization" defaultValue={incident.buyerOrganization} required /></label>
              <label><span>Plant</span><input name="plant" defaultValue={incident.plant} required /></label>
              <label><span>Plant time zone <small>IANA</small></span><input name="plantTimeZone" defaultValue={incident.plantTimeZone} placeholder="America/Chicago" required /></label>
              <label><span>Production line</span><input name="productionLine" defaultValue={incident.productionLine} required /></label>
              <label className="brief-wide"><span>Incident cause</span><input name="cause" defaultValue={incident.cause} required /></label>
              <label><span>Incumbent supplier</span><input name="incumbentSupplier" defaultValue={incident.incumbentSupplier} required /></label>
              <label><span>Part number</span><input name="partNumber" defaultValue={incident.partNumber} required /></label>
              <label><span>Part name</span><input name="partName" defaultValue={incident.partName} required /></label>
              <label><span>Shortfall quantity</span><input name="shortfall" type="number" min="1" step="1" defaultValue={incident.shortfall} required /></label>
              <label><span>Quantity unit</span><input name="quantityUnit" defaultValue={incident.quantityUnit} placeholder="units, tonnes, cases" required /></label>
              <label><span>Need-by date</span><input name="needBy" type="date" defaultValue={incident.requirements.needBy} required /></label>
              <label className="brief-wide"><span>Line-stop timestamp <small>ISO 8601 with UTC offset</small></span><input name="lineStopAt" defaultValue={incident.lineStopAt} placeholder="2026-08-11T09:30:00-05:00" required /></label>
              <label><span>Unit price ceiling</span><input name="maxUnitPrice" type="number" min="0.01" step="0.01" defaultValue={incident.requirements.maxUnitPrice} required /></label>
              <label><span>Currency</span><input name="currency" maxLength={3} defaultValue={incident.requirements.currency} required /></label>
              <label><span>Daily downtime exposure</span><input name="estimatedDowntimeCost" type="number" min="1" step="1" defaultValue={incident.estimatedDowntimeCost} required /></label>
              <label className="brief-wide"><span>Approved parts <small>comma separated</small></span><input name="approvedSubstituteParts" defaultValue={incident.requirements.approvedSubstituteParts.join(", ")} required /></label>
              <label className="brief-wide"><span>Required certifications <small>comma separated</small></span><input name="requiredCertifications" defaultValue={incident.requirements.requiredCertifications.join(", ")} required /></label>
              <label className="brief-wide"><span>Allowed origins <small>ISO country codes</small></span><input name="allowedOrigins" defaultValue={incident.requirements.allowedOrigins.join(", ")} required /></label>
            </div>
            <div className="brief-proof"><ShieldCheck size={15} /><span>Validated before live outreach. Unknown or malformed fields stop the run.</span></div>
            <div className="modal-actions brief-actions">
              <button type="button" className="secondary-button" onClick={restoreReferenceBrief}>Restore reference</button>
              <button type="submit" className="primary-button wide"><FileCheck2 size={16} /> Apply brief &amp; reset run</button>
            </div>
          </form>
        </div>
      )}

      {showGuide && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowGuide(false)}>
          <section className="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowGuide(false)} aria-label="Close product tour"><X size={18} /></button>
            <div className="guide-hero">
              <span className="modal-symbol"><Route size={23} /></span>
              <div><span className="panel-kicker">90-SECOND PRODUCT TOUR</span><h2 id="guide-title">See the decision, not just the calls.</h2></div>
            </div>
            <p>Run one sample recovery sprint, then inspect why CapacityLine recommends one supplier and blocks a cheaper one.</p>
            <div className="guide-steps">
              <div><span>01</span><div><strong>Launch</strong><small>Start the safe six-second scenario. No phone calls are created.</small></div></div>
              <div><span>02</span><div><strong>Compare</strong><small>Watch five supplier outcomes resolve into qualified, review, blocked, and no-answer states.</small></div></div>
              <div><span>03</span><div><strong>Verify</strong><small>Trace all eight checks—including approved-part validation—to identity and transcript evidence.</small></div></div>
              <div><span>04</span><div><strong>Approve</strong><small>Send the qualified option to RFQ review. CapacityLine never places the order.</small></div></div>
            </div>
            <div className="guide-disclaimer"><ShieldCheck size={15} /><span>Sample scenario · modeled exposure · no claimed savings</span></div>
            <div className="modal-actions"><button className="secondary-button" onClick={() => setShowGuide(false)}>Close</button><button className="primary-button wide" onClick={() => { setShowGuide(false); setShowLaunch(true); }}><Play size={15} fill="currentColor" /> Start guided tour</button></div>
          </section>
        </div>
      )}

      {showLaunch && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowLaunch(false)}>
          <section className="launch-modal" role="dialog" aria-modal="true" aria-labelledby="launch-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLaunch(false)} aria-label="Close"><X size={18} /></button>
            <div className="modal-symbol"><PhoneCall size={24} /></div>
            <span className="panel-kicker">RECOVERY SPRINT</span>
            <h2 id="launch-title">Watch the recovery decision unfold.</h2>
            <p>This sandbox evaluates five sample supplier outcomes and never creates a phone call.</p>

            <div className="mode-picker">
              <button className={launchMode === "demo" ? "selected" : ""} onClick={() => { setLaunchMode("demo"); setError(null); }}>
                <span><Sparkles size={18} /></span>
                <div><strong>Safe simulation</strong><small>Sample results · no phone calls</small></div>
                {launchMode === "demo" && <CheckCircle2 size={18} />}
              </button>
              {liveReady ? (
                <button className={launchMode === "live" ? "selected" : ""} onClick={() => { setLaunchMode("live"); setError(null); }}>
                  <span><Activity size={18} /></span>
                  <div><strong>Private live pilot</strong><small>Approved recipients only</small></div>
                  {launchMode === "live" && <CheckCircle2 size={18} />}
                </button>
              ) : (
                <a className="private-pilot-card" href="/pilot">
                  <span><LockKeyhole size={18} /></span>
                  <div><strong>Private live pilot</strong><small>Managed and usage-controlled</small></div>
                  <ArrowRight size={18} />
                </a>
              )}
            </div>

            {launchMode === "demo" ? (
              <div className="preview-box">
                <div><strong>5</strong><small>sample supplier outcomes</small></div>
                <ArrowRight size={17} />
                <div><strong>8</strong><small>guardrails checked</small></div>
                <ArrowRight size={17} />
                <div><strong>1</strong><small>human approval</small></div>
              </div>
            ) : (
              <div className="live-config">
                <div className="live-warning"><AlertTriangle size={16} /><span>Live mode creates real outbound calls and usage cost. It is restricted to an operational supply exception and business contacts who expect the call.</span></div>
                <div className="compliance-fields">
                  <label><span>Responsible operator</span><input value={operatorName} onChange={(event) => setOperatorName(event.target.value)} placeholder="Full name" /></label>
                  <label><span>Consent / authorization reference</span><input value={consentReference} onChange={(event) => setConsentReference(event.target.value)} placeholder="CRM record, email, or agreement ID" /></label>
                </div>
                <div className="phone-input-list live-roster">
                  <div className="live-roster-head"><span>Supplier</span><span>Region</span><span>Locale</span><span>Approved number</span></div>
                  {suppliers.map((supplier) => (
                    <div className="live-recipient-row" key={supplier.id}>
                      <input
                        value={liveSupplierNames[supplier.id] ?? ""}
                        onChange={(event) => setLiveSupplierNames((current) => ({ ...current, [supplier.id]: event.target.value }))}
                        aria-label={`${supplier.name} supplier name`}
                      />
                      <input
                        value={liveRegions[supplier.id] ?? ""}
                        onChange={(event) => setLiveRegions((current) => ({ ...current, [supplier.id]: event.target.value.toUpperCase().slice(0, 2) }))}
                        aria-label={`${supplier.name} country code`}
                        maxLength={2}
                      />
                      <input
                        value={liveLocales[supplier.id] ?? ""}
                        onChange={(event) => setLiveLocales((current) => ({ ...current, [supplier.id]: event.target.value }))}
                        aria-label={`${supplier.name} locale`}
                      />
                      <input
                        value={livePhones[supplier.id] ?? ""}
                        onChange={(event) => setLivePhones((current) => ({ ...current, [supplier.id]: event.target.value }))}
                        placeholder="+14155550100"
                        inputMode="tel"
                        aria-label={`${supplier.name} phone number`}
                      />
                    </div>
                  ))}
                </div>
                {allowListEnabled && <div className="allowlist-note"><ShieldCheck size={14} /> Recipient approval is active.</div>}
                <div className="compliance-checklist">
                  <label className="consent-check"><input type="checkbox" checked={operationalPurposeConfirmed} onChange={(event) => setOperationalPurposeConfirmed(event.target.checked)} /><span>This is supplier capacity verification for a real operational exception—not marketing or prospecting.</span></label>
                  <label className="consent-check"><input type="checkbox" checked={relationshipConfirmed} onChange={(event) => setRelationshipConfirmed(event.target.checked)} /><span>Every recipient is an existing supplier or a business contact specifically authorized for this call.</span></label>
                  <label className="consent-check"><input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} /><span>Prior express consent or equivalent authorization is documented in the reference above.</span></label>
                  <label className="consent-check"><input type="checkbox" checked={jurisdictionReviewed} onChange={(event) => setJurisdictionReviewed(event.target.checked)} /><span>I reviewed the applicable jurisdiction, local calling window, caller ID, and recording/transcription rules.</span></label>
                  <label className="consent-check"><input type="checkbox" checked={disclosureScriptApproved} onChange={(event) => setDisclosureScriptApproved(event.target.checked)} /><span>The AI identity, buyer, purpose, transcript notice, and immediate-stop disclosure script is approved.</span></label>
                </div>
                <label className="confirmation-field">
                  <span>Type <strong>AUTHORIZE SUPPLIER RECOVERY</strong> to continue</span>
                  <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                </label>
              </div>
            )}

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowLaunch(false)}>Cancel</button>
              <button className="primary-button wide" onClick={launchMode === "demo" ? runDemo : runLive}>
                {launchMode === "demo" ? <Play size={16} fill="currentColor" /> : <PhoneCall size={16} />}
                {launchMode === "demo" ? "Run decision simulation" : "Launch governed supplier calls"}
              </button>
            </div>
            <div className="modal-foot"><ShieldCheck size={14} /> No purchase is placed. Unknown or ambiguous answers are sent to human review.</div>
          </section>
        </div>
      )}

      {selectedSupplier && (
        <SupplierDrawer
          supplier={selectedSupplier}
          commitment={selectedCommitment}
          evaluation={selectedEvaluation}
          approved={approvedSupplierId === selectedSupplier.id}
          recommended={recommendedSupplier?.id === selectedSupplier.id}
          quantityUnit={incident.quantityUnit}
          onClose={() => setSelectedSupplierId(null)}
          onApprove={() => approveSupplier(selectedSupplier.id)}
        />
      )}
    </div>
  );
}

function LedgerView({
  quantityUnit,
  suppliers,
  commitments,
  evaluations,
  recommendedId,
  onOpen,
  onReturn,
  onExport,
}: {
  quantityUnit: string;
  suppliers: Supplier[];
  commitments: Record<string, SupplierCommitment | null | undefined>;
  evaluations: Record<string, SupplierEvaluation>;
  recommendedId?: string;
  onOpen: (id: string) => void;
  onReturn: () => void;
  onExport: (format: "json" | "csv") => void;
}) {
  const recorded = suppliers.filter((supplier) => supplier.id in commitments);
  return (
    <div className="page-stack ledger-page">
      <section className="section-intro">
        <div><span className="panel-kicker">DECISION PROVENANCE</span><h2>Every recommendation stays attached to the words that support it.</h2><p>Structured commitments, policy checks, and transcript evidence form an inspectable record. Silence is never treated as consent.</p></div>
        <div className="evidence-tools">
          <div className="evidence-score"><ShieldCheck size={24} /><strong>{recorded.length ? "100%" : "—"}</strong><span>traceable outcomes</span></div>
          {recorded.length > 0 && (
            <div className="export-buttons">
              <button onClick={() => onExport("json")}><Download size={14} /> Evidence Pack</button>
              <button onClick={() => onExport("csv")}><Download size={14} /> CSV matrix</button>
            </div>
          )}
        </div>
      </section>
      {recorded.length === 0 ? (
        <section className="empty-state panel"><Database size={30} /><h3>No commitments recorded yet</h3><p>Run the safe scenario to populate the evidence ledger.</p><button className="primary-button" onClick={onReturn}>Open recovery desk</button></section>
      ) : (
        <section className="ledger-grid">
          {recorded.map((supplier) => {
            const commitment = commitments[supplier.id];
            const evaluation = evaluations[supplier.id];
            return (
              <button className={`ledger-card ${recommendedId === supplier.id ? "ledger-recommended" : ""}`} key={supplier.id} onClick={() => onOpen(supplier.id)}>
                <div className="ledger-card-top"><span className="country-code">{supplier.countryCode}</span><StatusBadge status={supplier.status} /></div>
                <h3>{supplier.name}{recommendedId === supplier.id && <em className="best-match-inline">Best match</em>}</h3>
                {commitment ? (
                  <>
                    <blockquote>“{commitment.evidenceQuote}”</blockquote>
                    <div className="ledger-facts"><span><strong>{commitment.quantityAvailable?.toLocaleString()}</strong> {quantityUnit}</span><span><strong>{formatDate(commitment.earliestShipDate)}</strong> ship</span><span><strong>{Math.round(commitment.confidence * 100)}%</strong> confidence</span></div>
                    <div className="check-dots" aria-label={`${evaluation?.score ?? 0} percent fit`}>
                      {evaluation?.checks.map((check) => <i key={check.key} className={check.passed ? "pass" : "fail"} title={check.label} />)}
                    </div>
                  </>
                ) : (
                  <div className="no-evidence"><PhoneCall size={18} /> No commitment obtained. Recorded as unreachable.</div>
                )}
                <span className="open-record">Open evidence record <ArrowRight size={14} /></span>
              </button>
            );
          })}
        </section>
      )}
    </div>
  );
}

function SupplierGraph({ incident, suppliers, commitments, recommendedId }: { incident: RecoveryIncident; suppliers: Supplier[]; commitments: Record<string, SupplierCommitment | null | undefined>; recommendedId?: string }) {
  return (
    <div className="page-stack graph-page">
      <section className="section-intro">
        <div><span className="panel-kicker">PRIVATE OPERATING HISTORY</span><h2>From contact list to commitment graph.</h2><p>CapacityLine learns who answers, who has authority, what they commit, and—after ERP reconciliation—what they actually deliver. Records stay private to each customer workspace.</p></div>
        <div className="graph-stat"><Network size={24} /><strong>5</strong><span>approved supplier edges</span></div>
      </section>
      <section className="panel graph-canvas">
        <div className="buyer-node"><div className="node-logo">{incident.buyerOrganization.charAt(0).toUpperCase()}</div><strong>{incident.buyerOrganization}</strong><small>{incident.plant} · {incident.productionLine}</small></div>
        <div className="graph-lines" aria-hidden="true">
          {suppliers.map((supplier, index) => <i key={supplier.id} style={{ top: `${14 + index * 18}%`, width: `${38 + index * 4}%` }} />)}
        </div>
        <div className="supplier-nodes">
          {suppliers.map((supplier) => {
            const commitment = commitments[supplier.id];
            return (
              <div className={`graph-node graph-${supplier.status} ${recommendedId === supplier.id ? "graph-recommended" : ""}`} key={supplier.id}>
                <span className="country-code">{supplier.countryCode}</span>
                <div><strong>{supplier.name}{recommendedId === supplier.id && <em className="best-match-inline">Best</em>}</strong><small>{supplier.historicalReliability}% historical reliability</small></div>
                <div className="node-signal"><i style={{ width: `${supplier.historicalReliability}%` }} />{commitment && <em>evidence</em>}</div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="moat-grid">
        <article><PhoneCall size={19} /><strong>Response behavior</strong><p>Pickup, transfer, and time-to-commit patterns by supplier and region.</p></article>
        <article><FileCheck2 size={19} /><strong>Promise integrity</strong><p>Exact quantity, date, authority, and evidence captured at decision time.</p></article>
        <article><Activity size={19} /><strong>Delivery calibration</strong><p>Future ERP reconciliation converts promises into supplier reliability signals.</p></article>
      </section>
    </div>
  );
}

function SupplierDrawer({
  supplier,
  commitment,
  evaluation,
  approved,
  recommended,
  quantityUnit,
  onClose,
  onApprove,
}: {
  supplier: Supplier;
  commitment: SupplierCommitment | null | undefined;
  evaluation: SupplierEvaluation | undefined;
  approved: boolean;
  recommended: boolean;
  quantityUnit: string;
  onClose: () => void;
  onApprove: () => void;
}) {
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="supplier-drawer" role="dialog" aria-modal="true" aria-label={`${supplier.name} evidence`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="drawer-header">
          <div className="drawer-title"><span className="country-code large">{supplier.countryCode}</span><div><span className="panel-kicker">SUPPLIER EVIDENCE</span><h2>{supplier.name}</h2><p>{supplier.location} · {supplier.maskedPhone}</p></div></div>
          <button onClick={onClose} aria-label="Close evidence drawer"><X size={19} /></button>
        </header>

        {!commitment ? (
          <div className="drawer-empty"><PhoneCall size={28} /><h3>{supplier.status === "unreachable" ? "No live commitment obtained" : "No result yet"}</h3><p>{supplier.status === "unreachable" ? "The allowed attempt ended without a verified answer. CapacityLine records this as unknown and never infers availability." : "Launch the recovery sprint to gather a transcript-grounded commitment."}</p></div>
        ) : (
          <div className="drawer-body">
            <section className={`recommendation recommendation-${evaluation?.disposition}`}>
              <div><span className="recommendation-status"><StatusBadge status={supplier.status} />{recommended && <em>RECOMMENDED</em>}</span><strong>{evaluation?.score ?? 0}<small>/100 fit</small></strong></div>
              <p>{evaluation?.explanation}</p>
            </section>
            <section className="commitment-summary">
              <div><span>Quantity</span><strong>{commitment.quantityAvailable?.toLocaleString() ?? "—"}</strong><small>{quantityUnit}</small></div>
              <div><span>Earliest ship</span><strong>{formatDate(commitment.earliestShipDate)}</strong><small>{commitment.originCountry} origin</small></div>
              <div><span>Unit price</span><strong>{commitment.unitPrice ? `$${commitment.unitPrice.toFixed(2)}` : "—"}</strong><small>MOQ {commitment.moq?.toLocaleString() ?? "—"}</small></div>
            </section>
            <section className="drawer-section">
              <div className="drawer-section-title"><h3>Policy evaluation</h3><span>{evaluation?.checks.filter((check) => check.passed).length}/{evaluation?.checks.length} passed</span></div>
              <div className="check-list">
                {evaluation?.checks.map((check) => (
                  <div key={check.key} className={check.passed ? "check-pass" : "check-fail"}>
                    <span>{check.passed ? <Check size={14} /> : <X size={14} />}</span>
                    <div><strong>{check.label}</strong><small>{check.detail}</small></div>
                    {!check.passed && <em>{check.severity === "hard" ? "BLOCK" : "REVIEW"}</em>}
                  </div>
                ))}
              </div>
            </section>
            <section className="drawer-section evidence-section">
              <div className="drawer-section-title"><h3>Grounding evidence</h3><span>{Math.round(commitment.confidence * 100)}% confidence</span></div>
              <blockquote>“{commitment.evidenceQuote}”</blockquote>
              <div className="respondent"><BadgeCheck size={16} /><div><strong>{commitment.respondentName}</strong><small>{commitment.respondentTitle} · authority {commitment.authorityConfirmed ? "confirmed" : "not confirmed"}</small></div></div>
            </section>
            {commitment.constraints.length > 0 && (
              <section className="drawer-section"><div className="drawer-section-title"><h3>Conditions stated</h3></div><ul className="constraint-list">{commitment.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></section>
            )}
            <section className="drawer-section transcript-section">
              <div className="drawer-section-title"><h3>Simulated CALL-E transcript</h3><span>{formatDuration(commitment.callDurationSeconds)}</span></div>
              <div className="transcript-list">
                {commitment.transcript.map((turn, index) => (
                  <div className={`transcript-turn ${turn.speaker}`} key={`${turn.offsetSeconds}-${index}`}>
                    <span>{turn.speaker === "agent" ? "CALL-E" : "SUPPLIER"}<time>{Math.floor(turn.offsetSeconds / 60)}:{String(turn.offsetSeconds % 60).padStart(2, "0")}</time></span>
                    <p>{turn.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        <footer className="drawer-footer">
          <div><LockKeyhole size={15} /><span>Approval creates an RFQ handoff—not a purchase order.</span></div>
          {commitment && evaluation?.disposition === "qualified" && (
            <button className="primary-button" onClick={onApprove} disabled={approved}>
              {approved ? <><Check size={16} /> RFQ approved</> : <><FileCheck2 size={16} /> Approve RFQ handoff</>}
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}
