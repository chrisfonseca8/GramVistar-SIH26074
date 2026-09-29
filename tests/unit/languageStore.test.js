import { beforeEach, describe, expect, it } from "vitest";
import { useLanguageStore } from "@/store/languageStore";

describe("useLanguageStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useLanguageStore.setState({ language: "en" });
  });

  it("defaults to English", () => {
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("setLanguage switches to Hindi and back", () => {
    useLanguageStore.getState().setLanguage("hi");
    expect(useLanguageStore.getState().language).toBe("hi");
    useLanguageStore.getState().setLanguage("en");
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("persists the language to localStorage", () => {
    useLanguageStore.getState().setLanguage("hi");
    const raw = localStorage.getItem("chas-language-store");
    expect(JSON.parse(raw).state.language).toBe("hi");
  });
});
