import { describe, expect, it } from "vitest";
import { buildDemoCommitments } from "@/lib/demo-data";
import { materializePlaybookIncident, RECOVERY_PLAYBOOKS } from "@/lib/recovery-playbooks";
import { validateRecoveryIncident } from "@/lib/incident";

describe("recovery playbooks", () => {
  it("ships six distinct launch scenarios with a complete five-supplier roster", () => {
    expect(RECOVERY_PLAYBOOKS).toHaveLength(6);
    expect(new Set(RECOVERY_PLAYBOOKS.map((playbook) => playbook.useCaseSlug)).size).toBe(6);
    for (const playbook of RECOVERY_PLAYBOOKS) {
      expect(playbook.suppliers).toHaveLength(5);
      expect(new Set(playbook.suppliers.map((supplier) => supplier.id)).size).toBe(5);
      expect(validateRecoveryIncident(playbook.incident).ok).toBe(true);
    }
  });

  it("materializes deadlines relative to the session instead of expiring after submission", () => {
    const now = new Date("2026-10-05T12:00:00.000Z");
    const incident = materializePlaybookIncident(RECOVERY_PLAYBOOKS[0], now);

    expect(new Date(incident.lineStopAt).getTime() - now.getTime()).toBe(47 * 60 * 60 * 1_000);
    expect(incident.requirements.needBy).toBe("2026-10-07");
    expect(validateRecoveryIncident(incident).ok).toBe(true);
  });

  it("keeps replay quantities credible for every non-manufacturing unit", () => {
    const now = new Date("2026-10-05T12:00:00.000Z");

    for (const playbook of RECOVERY_PLAYBOOKS.slice(1)) {
      const incident = materializePlaybookIncident(playbook, now);
      const commitments = buildDemoCommitments(incident);
      const required = incident.requirements.quantity;

      expect(commitments["sup-kanto"]?.quantityAvailable).toBe(required);
      expect(commitments["sup-pacific"]?.quantityAvailable).toBeGreaterThanOrEqual(required);
      expect(commitments["sup-delta"]?.quantityAvailable).toBeGreaterThanOrEqual(required);
      expect(commitments["sup-rhein"]?.quantityAvailable).toBeLessThan(required);
    }
  });
});
