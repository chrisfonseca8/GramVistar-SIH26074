import { describe, expect, it } from "vitest";
import {
  findMissingColumns,
  parseBoolean,
  parseNumber,
  parseString,
  parseTimestamp,
  parseYearMonth,
} from "@/data/schemas/validate";

describe("parseNumber", () => {
  it("parses valid numeric strings", () => {
    expect(parseNumber("28.5")).toBe(28.5);
    expect(parseNumber("0")).toBe(0);
  });

  it("returns null for missing/empty/invalid input, never 0", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber(null)).toBeNull();
    expect(parseNumber("not-a-number")).toBeNull();
  });
});

describe("parseString", () => {
  it("trims and returns null for empty input", () => {
    expect(parseString("  Alkusha  ")).toBe("Alkusha");
    expect(parseString("")).toBeNull();
    expect(parseString(undefined)).toBeNull();
  });
});

describe("parseBoolean", () => {
  it("parses True/False strings case-insensitively", () => {
    expect(parseBoolean("True")).toBe(true);
    expect(parseBoolean("false")).toBe(false);
  });

  it("returns null for anything else", () => {
    expect(parseBoolean("")).toBeNull();
    expect(parseBoolean("maybe")).toBeNull();
  });
});

describe("parseYearMonth", () => {
  it("parses YYYY-MM into a UTC first-of-month date", () => {
    const result = parseYearMonth("2016-01");
    expect(result).not.toBeNull();
    expect(result.year).toBe(2016);
    expect(result.month).toBe(1);
    expect(result.date.toISOString()).toBe("2016-01-01T00:00:00.000Z");
  });

  it("returns null for malformed input", () => {
    expect(parseYearMonth("2016-13-01")).toBeNull();
    expect(parseYearMonth("not-a-month")).toBeNull();
  });
});

describe("parseTimestamp", () => {
  it("parses YYYY-MM-DD HH:MM:SS as UTC", () => {
    const result = parseTimestamp("2026-09-27 00:00:00");
    expect(result).not.toBeNull();
    expect(result.iso).toBe("2026-09-27T00:00:00.000Z");
  });

  it("returns null for malformed input", () => {
    expect(parseTimestamp("not-a-timestamp")).toBeNull();
  });
});

describe("findMissingColumns", () => {
  it("returns the required columns when rows are empty", () => {
    expect(findMissingColumns([], ["a", "b"])).toEqual(["a", "b"]);
  });

  it("returns only columns absent from the first row", () => {
    expect(findMissingColumns([{ a: "1" }], ["a", "b"])).toEqual(["b"]);
    expect(findMissingColumns([{ a: "1", b: "2" }], ["a", "b"])).toEqual([]);
  });
});
