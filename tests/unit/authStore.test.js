import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/store/authStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ role: null, hasHydrated: true });
  });

  it("starts logged out", () => {
    expect(useAuthStore.getState().role).toBeNull();
  });

  it("login sets the role", () => {
    useAuthStore.getState().login("Farmer");
    expect(useAuthStore.getState().role).toBe("Farmer");
  });

  it("logout clears the role", () => {
    useAuthStore.getState().login("Scientist / KVK");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().role).toBeNull();
  });

  it("persists only the role to localStorage, not hasHydrated", () => {
    useAuthStore.getState().login("Farmer");
    const raw = localStorage.getItem("chas-auth-store");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.state.role).toBe("Farmer");
    expect(parsed.state.hasHydrated).toBeUndefined();
  });
});
