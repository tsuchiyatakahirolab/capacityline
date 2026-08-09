"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Database,
  FileCheck2,
  Gauge,
  Headphones,
  History,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Network,
  PhoneCall,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEMO_COMMITMENTS,
  DEMO_INCIDENT,
  DEMO_REVEAL_ORDER,
  DEMO_SUPPLIERS,
} from "@/lib/demo-data";
import { evaluateCommitment } from "@/lib/evaluate";
import { normalizeCalleCommitment } from "@/lib/normalize";
import { E164_PATTERN } from "@/lib/phone";
import type {
  LiveRecipient,
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
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

function Countdown() {
  const [remaining, setRemaining] = useState(47 * 60 * 60 + 18 * 60 + 22);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, []);

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

export function CapacityLineApp() {
  const [view, setView] = useState<View>("desk");
  const [phase, setPhase] = useState<Phase>("ready");
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => DEMO_SUPPLIERS.map((item) => ({ ...item })));
  const [commitments, setCommitments] = useState<Record<string, SupplierCommitment | null | undefined>>({});
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [approvedSupplierId, setApprovedSupplierId] = useState<string | null>(null);
  const [showLaunch, setShowLaunch] = useState(false);
  const [launchMode, setLaunchMode] = useState<LaunchMode>("demo");
  const [liveReady, setLiveReady] = useState(false);
  const [allowListEnabled, setAllowListEnabled] = useState(false);
  const [livePhones, setLivePhones] = useState<Record<string, string>>({});
  const [authorized, setAuthorized] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [liveSupplierIds, setLiveSupplierIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then((data: { liveReady?: boolean; allowListEnabled?: boolean }) => {
        setLiveReady(Boolean(data.liveReady));
        setAllowListEnabled(Boolean(data.allowListEnabled));
      })
      .catch(() => setLiveReady(false));
  }, []);

  const evaluations = useMemo(() => {
    const result: Record<string, SupplierEvaluation> = {};
    for (const supplier of suppliers) {
      if (supplier.id in commitments) {
        result[supplier.id] = evaluateCommitment(
          DEMO_INCIDENT.requirements,
          commitments[supplier.id] ?? null,
          supplier.id,
        );
      }
    }
    return result;
  }, [commitments, suppliers]);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null;
  const selectedCommitment = selectedSupplierId ? commitments[selectedSupplierId] : undefined;
  const selectedEvaluation = selectedSupplierId ? evaluations[selectedSupplierId] : undefined;
  const qualifiedCount = suppliers.filter((supplier) => supplier.status === "qualified").length;
  const completedCount = suppliers.filter((supplier) => !["ready", "calling"].includes(supplier.status)).length;

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const updateSupplierStatus = useCallback((supplierId: string, status: SupplierStatus) => {
    setSuppliers((current) =>
      current.map((supplier) => (supplier.id === supplierId ? { ...supplier, status } : supplier)),
    );
  }, []);

  const revealCommitment = useCallback(
    (supplierId: string, commitment: SupplierCommitment | null) => {
      setCommitments((current) => ({ ...current, [supplierId]: commitment }));
      const evaluation = evaluateCommitment(DEMO_INCIDENT.requirements, commitment, supplierId);
      updateSupplierStatus(supplierId, evaluation.disposition);
      setRevealCount((count) => count + 1);
    },
    [updateSupplierStatus],
  );

  const reset = useCallback(() => {
    clearTimers();
    setPhase("ready");
    setSuppliers(DEMO_SUPPLIERS.map((item) => ({ ...item })));
    setCommitments({});
    setSelectedSupplierId(null);
    setApprovedSupplierId(null);
    setActiveCallId(null);
    setLiveSupplierIds([]);
    setRevealCount(0);
    setError(null);
  }, [clearTimers]);

  async function runDemo() {
    setError(null);
    setShowLaunch(false);
    setPhase("running");
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
        () => revealCommitment(supplierId, DEMO_COMMITMENTS[supplierId] ?? null),
        900 + index * 850,
      );
      timers.current.push(timer);
    });
    timers.current.push(
      window.setTimeout(() => {
        setPhase("complete");
        setSelectedSupplierId("sup-kanto");
      }, 900 + DEMO_REVEAL_ORDER.length * 850),
    );
  }

  async function runLive() {
    const chosen = suppliers.filter((supplier) => livePhones[supplier.id]?.trim());
    if (!liveReady) {
      setError("Add CALLE_API_KEY on the server before using live mode.");
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
    if (!authorized || confirmation !== "AUTHORIZE CALLS") {
      setError("Confirm contact authorization and type AUTHORIZE CALLS.");
      return;
    }

    const recipients: LiveRecipient[] = chosen.map((supplier) => ({
      supplierId: supplier.id,
      phone: livePhones[supplier.id].trim(),
      region: supplier.countryCode,
      locale: supplier.locale,
    }));

    setError(null);
    setPhase("running");
    setShowLaunch(false);
    setSuppliers((current) =>
      current.map((supplier) => ({
        ...supplier,
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
    } catch (caught) {
      setPhase("ready");
      setSuppliers(DEMO_SUPPLIERS.map((item) => ({ ...item })));
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

  const activityItems = [
    { time: "09:31", title: "Supply exception opened", detail: "6,000-unit shortfall threatens E-Drive Line 2", tone: "danger" },
    ...(phase !== "ready"
      ? [{ time: "09:32", title: "Recovery sprint launched", detail: "Approved backup suppliers contacted in parallel", tone: "active" }]
      : []),
    ...(revealCount > 0
      ? [{ time: "09:36", title: "First live responses", detail: `${completedCount} commitments returned with transcript evidence`, tone: "active" }]
      : []),
    ...(qualifiedCount > 0
      ? [{ time: "09:44", title: "Qualified fallback found", detail: "All seven procurement guardrails passed", tone: "success" }]
      : []),
    ...(phase === "approved"
      ? [{ time: "09:47", title: "RFQ handoff approved", detail: `${suppliers.find((item) => item.id === approvedSupplierId)?.name} sent to buyer workflow`, tone: "success" }]
      : []),
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><span /><span /><span /></div>
          <div>
            <strong>CapacityLine</strong>
            <small>SUPPLY RECOVERY</small>
          </div>
        </div>

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
            <strong>{DEMO_INCIDENT.partNumber}</strong>
            <small>Line stop in 47h</small>
          </span>
          <ChevronRight size={16} />
        </button>

        <div className="sidebar-spacer" />
        <div className="provider-card">
          <div><Zap size={15} fill="currentColor" /> Powered by CALL-E</div>
          <p>Goal-driven parallel calls with structured results and transcript evidence.</p>
          <span className="connection-state"><i /> Integration ready</span>
        </div>
        <div className="profile-chip">
          <div className="avatar">TT</div>
          <div><strong>Takahiro Tsuchiya</strong><small>Resilience operator</small></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">NORTHSTAR MOBILITY / OSAKA PLANT</div>
            <h1>{view === "desk" ? "Recovery desk" : view === "ledger" ? "Commitment ledger" : "Supplier graph"}</h1>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input aria-label="Search" placeholder="Search recovery records" />
              <kbd>⌘ K</kbd>
            </label>
            <div className="demo-chip"><Sparkles size={14} /> Accelerated demo</div>
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
            <section className="incident-hero">
              <div className="incident-copy">
                <div className="hero-badges">
                  <span className="critical-badge">CRITICAL</span>
                  <span>{DEMO_INCIDENT.id}</span>
                  <span>Opened 4 min ago</span>
                </div>
                <h2>Recover supply before the line stops.</h2>
                <p>
                  {DEMO_INCIDENT.incumbentSupplier} reported an unplanned outage. Verify live capacity
                  across approved backups and surface the first actionable fallback.
                </p>
                <div className="incident-facts">
                  <span><Building2 size={15} /> {DEMO_INCIDENT.productionLine}</span>
                  <span><Target size={15} /> {DEMO_INCIDENT.shortfall.toLocaleString()} units short</span>
                  <span><CircleDollarSign size={15} /> {formatMoney(DEMO_INCIDENT.estimatedDowntimeCost)} / day at risk</span>
                </div>
              </div>
              <div className="countdown-card">
                <span>ESTIMATED LINE STOP</span>
                <Countdown />
                <small>AUG 11 · 09:30 JST</small>
                {phase === "ready" ? (
                  <button className="primary-button" onClick={() => setShowLaunch(true)}>
                    <Play size={16} fill="currentColor" /> Run recovery sprint
                  </button>
                ) : (
                  <button className="secondary-button inverse" onClick={reset}>
                    <RotateCcw size={15} /> Reset scenario
                  </button>
                )}
              </div>
            </section>

            {phase === "approved" && (
              <section className="approval-banner">
                <div className="approval-icon"><FileCheck2 size={22} /></div>
                <div>
                  <strong>Buyer handoff approved</strong>
                  <p>{suppliers.find((supplier) => supplier.id === approvedSupplierId)?.name} is ready for RFQ creation. CapacityLine has not placed an order.</p>
                </div>
                <span><Check size={15} /> Human-controlled</span>
              </section>
            )}

            <section className="metric-grid">
              <article className="metric-card accent">
                <div className="metric-icon"><Gauge size={19} /></div>
                <div><span>TIME TO FIRST QUALIFIED FALLBACK</span><strong>{qualifiedCount ? "12m 41s" : "—"}</strong></div>
                <small>{qualifiedCount ? "synthetic scenario: 8h manual" : "Clock starts at launch"}</small>
              </article>
              <article className="metric-card">
                <div className="metric-icon green"><BadgeCheck size={19} /></div>
                <div><span>QUALIFIED OPTIONS</span><strong>{qualifiedCount}<em> / {suppliers.length}</em></strong></div>
                <small>All hard guardrails passed</small>
              </article>
              <article className="metric-card">
                <div className="metric-icon amber"><Headphones size={19} /></div>
                <div><span>LIVE COMMITMENTS</span><strong>{completedCount}<em> / {suppliers.length}</em></strong></div>
                <small>{phase === "running" ? "Calls in progress" : "Transcript-grounded"}</small>
              </article>
              <article className="metric-card">
                <div className="metric-icon blue"><CircleDollarSign size={19} /></div>
                <div><span>DOWNTIME EXPOSURE AVOIDED</span><strong>{qualifiedCount ? "$420k" : "$0"}</strong></div>
                <small>Modeled one-day line impact</small>
              </article>
            </section>

            <section className="workspace-grid">
              <article className="panel supplier-panel">
                <div className="panel-header">
                  <div><span className="panel-kicker">PARALLEL OUTREACH</span><h3>Approved backup suppliers</h3></div>
                  <div className="panel-header-meta">
                    {phase === "running" && <span className="live-pill"><i /> LIVE</span>}
                    <span>{completedCount} of {suppliers.length} returned</span>
                  </div>
                </div>
                <div className="supplier-table-head">
                  <span>SUPPLIER</span><span>RELIABILITY</span><span>LIVE COMMITMENT</span><span>FIT</span><span />
                </div>
                <div className="supplier-list">
                  {suppliers.map((supplier) => {
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
                          <span><strong>{supplier.name}</strong><small>{supplier.location} · {supplier.approvalTier}</small></span>
                        </span>
                        <span className="reliability-cell">
                          <span className="reliability-track"><i style={{ width: `${supplier.historicalReliability}%` }} /></span>
                          <small>{supplier.historicalReliability}%</small>
                        </span>
                        <span className="commitment-cell">
                          {supplier.status === "calling" ? (
                            <span className="calling-wave"><i /><i /><i /><i /><small>CALL-E speaking</small></span>
                          ) : commitment ? (
                            <><strong>{commitment.quantityAvailable?.toLocaleString() ?? "—"} units</strong><small>{formatDate(commitment.earliestShipDate)} · {commitment.currency} {commitment.unitPrice?.toFixed(2) ?? "—"}</small></>
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
                </div>
                <div className="table-footnote">
                  <ShieldCheck size={15} /> Only pre-approved or conditionally approved contacts are callable. A human approves every commercial next step.
                </div>
              </article>

              <div className="right-rail">
                <article className="panel guardrail-panel">
                  <div className="panel-header compact">
                    <div><span className="panel-kicker">BUYER POLICY</span><h3>Qualification guardrails</h3></div>
                    <LockKeyhole size={17} />
                  </div>
                  <div className="guardrail-list">
                    <div><span>Quantity</span><strong>≥ 6,000 units</strong></div>
                    <div><span>Ship no later than</span><strong>Aug 11</strong></div>
                    <div><span>Unit price</span><strong>≤ USD 84.00</strong></div>
                    <div><span>Certifications</span><strong>IATF 16949 + ISO 9001</strong></div>
                    <div><span>Origin</span><strong>Approved countries only</strong></div>
                    <div><span>Decision authority</span><strong>Must be confirmed</strong></div>
                  </div>
                  <button className="text-button" onClick={() => setSelectedSupplierId(qualifiedCount ? "sup-kanto" : null)}>
                    View evaluation logic <ArrowRight size={14} />
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
                        <time>NOW</time><i /><div><strong>CALL-E is gathering commitments</strong><p>Adapting to holds, transfers, and incomplete answers</p></div>
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
            suppliers={suppliers}
            commitments={commitments}
            evaluations={evaluations}
            onOpen={setSelectedSupplierId}
            onReturn={() => setView("desk")}
          />
        )}

        {view === "graph" && <SupplierGraph suppliers={suppliers} commitments={commitments} />}
      </main>

      {showLaunch && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowLaunch(false)}>
          <section className="launch-modal" role="dialog" aria-modal="true" aria-labelledby="launch-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLaunch(false)} aria-label="Close"><X size={18} /></button>
            <div className="modal-symbol"><PhoneCall size={24} /></div>
            <span className="panel-kicker">RECOVERY SPRINT</span>
            <h2 id="launch-title">Get the first actionable fallback.</h2>
            <p>CapacityLine will contact approved suppliers in parallel and check every returned commitment against the buyer policy.</p>

            <div className="mode-picker">
              <button className={launchMode === "demo" ? "selected" : ""} onClick={() => { setLaunchMode("demo"); setError(null); }}>
                <span><Sparkles size={18} /></span>
                <div><strong>Safe demo</strong><small>Fictional results · no phone calls</small></div>
                {launchMode === "demo" && <CheckCircle2 size={18} />}
              </button>
              <button className={launchMode === "live" ? "selected" : ""} onClick={() => { setLaunchMode("live"); setError(null); }}>
                <span><Activity size={18} /></span>
                <div><strong>Live CALL-E</strong><small>{liveReady ? "Server key detected" : "API key required"}</small></div>
                {launchMode === "live" && <CheckCircle2 size={18} />}
              </button>
            </div>

            {launchMode === "demo" ? (
              <div className="preview-box">
                <div><strong>5</strong><small>parallel calls simulated</small></div>
                <ArrowRight size={17} />
                <div><strong>7</strong><small>guardrails checked</small></div>
                <ArrowRight size={17} />
                <div><strong>1</strong><small>human approval</small></div>
              </div>
            ) : (
              <div className="live-config">
                <div className="live-warning"><AlertTriangle size={16} /><span>Live mode creates real outbound calls and may incur CALL-E charges. Use only contacts who expect this test.</span></div>
                <div className="phone-input-list">
                  {suppliers.map((supplier) => (
                    <label key={supplier.id}>
                      <span>{supplier.name}<small>{supplier.countryCode}</small></span>
                      <input
                        value={livePhones[supplier.id] ?? ""}
                        onChange={(event) => setLivePhones((current) => ({ ...current, [supplier.id]: event.target.value }))}
                        placeholder="+14155550100"
                        inputMode="tel"
                        aria-label={`${supplier.name} phone number`}
                      />
                    </label>
                  ))}
                </div>
                {allowListEnabled && <div className="allowlist-note"><ShieldCheck size={14} /> Server-side number allow-list is enabled.</div>}
                <label className="consent-check">
                  <input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} />
                  <span>I am authorized to call these business contacts for this test.</span>
                </label>
                <label className="confirmation-field">
                  <span>Type <strong>AUTHORIZE CALLS</strong> to continue</span>
                  <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
                </label>
              </div>
            )}

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowLaunch(false)}>Cancel</button>
              <button className="primary-button wide" onClick={launchMode === "demo" ? runDemo : runLive}>
                {launchMode === "demo" ? <Play size={16} fill="currentColor" /> : <PhoneCall size={16} />}
                {launchMode === "demo" ? "Run 12-minute scenario" : "Create authorized calls"}
              </button>
            </div>
            <div className="modal-foot"><ShieldCheck size={14} /> No purchase is placed. Unknown or ambiguous answers fail closed to human review.</div>
          </section>
        </div>
      )}

      {selectedSupplier && (
        <SupplierDrawer
          supplier={selectedSupplier}
          commitment={selectedCommitment}
          evaluation={selectedEvaluation}
          approved={approvedSupplierId === selectedSupplier.id}
          onClose={() => setSelectedSupplierId(null)}
          onApprove={() => approveSupplier(selectedSupplier.id)}
        />
      )}
    </div>
  );
}

function LedgerView({
  suppliers,
  commitments,
  evaluations,
  onOpen,
  onReturn,
}: {
  suppliers: Supplier[];
  commitments: Record<string, SupplierCommitment | null | undefined>;
  evaluations: Record<string, SupplierEvaluation>;
  onOpen: (id: string) => void;
  onReturn: () => void;
}) {
  const recorded = suppliers.filter((supplier) => supplier.id in commitments);
  return (
    <div className="page-stack ledger-page">
      <section className="section-intro">
        <div><span className="panel-kicker">DECISION PROVENANCE</span><h2>Every recommendation stays attached to the words that support it.</h2><p>Structured commitments, policy checks, and transcript evidence form an inspectable record. Silence is never treated as consent.</p></div>
        <div className="evidence-score"><ShieldCheck size={24} /><strong>{recorded.length ? "100%" : "—"}</strong><span>traceable outcomes</span></div>
      </section>
      {recorded.length === 0 ? (
        <section className="empty-state panel"><Database size={30} /><h3>No commitments recorded yet</h3><p>Run the safe scenario to populate the evidence ledger.</p><button className="primary-button" onClick={onReturn}>Open recovery desk</button></section>
      ) : (
        <section className="ledger-grid">
          {recorded.map((supplier) => {
            const commitment = commitments[supplier.id];
            const evaluation = evaluations[supplier.id];
            return (
              <button className="ledger-card" key={supplier.id} onClick={() => onOpen(supplier.id)}>
                <div className="ledger-card-top"><span className="country-code">{supplier.countryCode}</span><StatusBadge status={supplier.status} /></div>
                <h3>{supplier.name}</h3>
                {commitment ? (
                  <>
                    <blockquote>“{commitment.evidenceQuote}”</blockquote>
                    <div className="ledger-facts"><span><strong>{commitment.quantityAvailable?.toLocaleString()}</strong> units</span><span><strong>{formatDate(commitment.earliestShipDate)}</strong> ship</span><span><strong>{Math.round(commitment.confidence * 100)}%</strong> confidence</span></div>
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

function SupplierGraph({ suppliers, commitments }: { suppliers: Supplier[]; commitments: Record<string, SupplierCommitment | null | undefined> }) {
  return (
    <div className="page-stack graph-page">
      <section className="section-intro">
        <div><span className="panel-kicker">COMPOUNDING DATA ASSET</span><h2>From contact list to commitment graph.</h2><p>CapacityLine learns who answers, who has authority, what they commit, and—after ERP reconciliation—what they actually deliver. Records remain tenant-private.</p></div>
        <div className="graph-stat"><Network size={24} /><strong>5</strong><span>approved supplier edges</span></div>
      </section>
      <section className="panel graph-canvas">
        <div className="buyer-node"><div className="node-logo">N</div><strong>Northstar Mobility</strong><small>Osaka · E-Drive Line 2</small></div>
        <div className="graph-lines" aria-hidden="true">
          {suppliers.map((supplier, index) => <i key={supplier.id} style={{ top: `${14 + index * 18}%`, width: `${38 + index * 4}%` }} />)}
        </div>
        <div className="supplier-nodes">
          {suppliers.map((supplier) => {
            const commitment = commitments[supplier.id];
            return (
              <div className={`graph-node graph-${supplier.status}`} key={supplier.id}>
                <span className="country-code">{supplier.countryCode}</span>
                <div><strong>{supplier.name}</strong><small>{supplier.historicalReliability}% historical reliability</small></div>
                <div className="node-signal"><i style={{ width: `${supplier.historicalReliability}%` }} />{commitment && <em>live</em>}</div>
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
  onClose,
  onApprove,
}: {
  supplier: Supplier;
  commitment: SupplierCommitment | null | undefined;
  evaluation: SupplierEvaluation | undefined;
  approved: boolean;
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
              <div><StatusBadge status={supplier.status} /><strong>{evaluation?.score ?? 0}<small>/100 fit</small></strong></div>
              <p>{evaluation?.explanation}</p>
            </section>
            <section className="commitment-summary">
              <div><span>Quantity</span><strong>{commitment.quantityAvailable?.toLocaleString() ?? "—"}</strong><small>units</small></div>
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
              <div className="drawer-section-title"><h3>CALL-E transcript</h3><span>{formatDuration(commitment.callDurationSeconds)}</span></div>
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
