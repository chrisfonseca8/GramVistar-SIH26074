import { describe, expect, it } from "vitest";
import { ROLES, ROLE_PORTAL_ACCESS, canAccessPortal, defaultPathForRole } from "@/lib/auth/permissions";

describe("canAccessPortal", () => {
  it("returns false for a null/undefined role", () => {
    expect(canAccessPortal(null, "scientist")).toBe(false);
    expect(canAccessPortal(undefined, "scientist")).toBe(false);
  });

  it("grants Super Admin every portal", () => {
    expect(canAccessPortal("Super Admin", "scientist")).toBe(true);
    expect(canAccessPortal("Super Admin", "farmer")).toBe(true);
    expect(canAccessPortal("Super Admin", "government")).toBe(true);
  });

  it("restricts Scientist / KVK to the scientist portal", () => {
    expect(canAccessPortal("Scientist / KVK", "scientist")).toBe(true);
    expect(canAccessPortal("Scientist / KVK", "farmer")).toBe(false);
    expect(canAccessPortal("Scientist / KVK", "government")).toBe(false);
  });

  it("restricts Farmer to the farmer portal", () => {
    expect(canAccessPortal("Farmer", "farmer")).toBe(true);
    expect(canAccessPortal("Farmer", "scientist")).toBe(false);
    expect(canAccessPortal("Farmer", "government")).toBe(false);
  });

  it("restricts DM/DC to the government portal", () => {
    expect(canAccessPortal("DM/DC", "government")).toBe(true);
    expect(canAccessPortal("DM/DC", "scientist")).toBe(false);
    expect(canAccessPortal("DM/DC", "farmer")).toBe(false);
  });

  it("has a portal mapping for every defined role", () => {
    for (const role of ROLES) {
      expect(ROLE_PORTAL_ACCESS[role]).toBeDefined();
      expect(ROLE_PORTAL_ACCESS[role].length).toBeGreaterThan(0);
    }
  });
});

describe("defaultPathForRole", () => {
  it("sends single-portal roles straight to their portal", () => {
    expect(defaultPathForRole("Scientist / KVK")).toBe("/scientist");
    expect(defaultPathForRole("Farmer")).toBe("/farmer");
    expect(defaultPathForRole("DM/DC")).toBe("/government");
  });

  it("sends multi-portal roles (Super Admin) to the home portal picker", () => {
    expect(defaultPathForRole("Super Admin")).toBe("/");
  });
});
