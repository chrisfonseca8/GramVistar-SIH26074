import { beforeEach, describe, expect, it } from "vitest";
import { useAuditStore } from "@/store/auditStore";

describe("useAuditStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuditStore.setState({ events: [], hasHydrated: true });
  });

  it("starts with no events", () => {
    expect(useAuditStore.getState().events).toEqual([]);
  });

  it("logEvent records type, role, an id and an ISO timestamp, newest first", () => {
    useAuditStore.getState().logEvent({ type: "login", role: "Farmer" });
    useAuditStore.getState().logEvent({ type: "logout", role: "Farmer" });

    const events = useAuditStore.getState().events;
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("logout");
    expect(events[1].type).toBe("login");
    for (const event of events) {
      expect(event.id).toBeTruthy();
      expect(() => new Date(event.timestamp).toISOString()).not.toThrow();
    }
  });

  it("carries optional details through unchanged", () => {
    useAuditStore.getState().logEvent({ type: "access_denied", role: "Farmer", details: { portal: "scientist" } });
    expect(useAuditStore.getState().events[0].details).toEqual({ portal: "scientist" });
  });

  it("persists events to localStorage", () => {
    useAuditStore.getState().logEvent({ type: "login", role: "Farmer" });
    const raw = localStorage.getItem("chas-audit-store");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw).state.events).toHaveLength(1);
  });
});
