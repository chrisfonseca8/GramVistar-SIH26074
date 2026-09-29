import { beforeEach, describe, expect, it } from "vitest";
import { useSelectionStore } from "@/store/selectionStore";

describe("useSelectionStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useSelectionStore.setState({ selectedPanchayat: null });
  });

  it("defaults to null (Chas Block, the block-level aggregate)", () => {
    expect(useSelectionStore.getState().selectedPanchayat).toBeNull();
  });

  it("setSelectedPanchayat updates the selection", () => {
    useSelectionStore.getState().setSelectedPanchayat("Alkusha");
    expect(useSelectionStore.getState().selectedPanchayat).toBe("Alkusha");
  });

  it("can be reset back to Chas Block (null)", () => {
    useSelectionStore.getState().setSelectedPanchayat("Kura");
    useSelectionStore.getState().setSelectedPanchayat(null);
    expect(useSelectionStore.getState().selectedPanchayat).toBeNull();
  });

  it("persists the selection to localStorage", () => {
    useSelectionStore.getState().setSelectedPanchayat("Kumhari");
    const raw = localStorage.getItem("chas-selection-store");
    expect(JSON.parse(raw).state.selectedPanchayat).toBe("Kumhari");
  });
});
