import { describe, expect, it } from "vitest";
import { normalizeInputValue } from "./formFieldValues";

describe("normalizeInputValue", () => {
  it("keeps zero for numeric input", () => {
    expect(normalizeInputValue("number", "0")).toBe(0);
  });

  it("returns empty string for cleared numeric input", () => {
    expect(normalizeInputValue("number", "")).toBe("");
  });

  it("parses numeric strings to numbers", () => {
    expect(normalizeInputValue("number", "42")).toBe(42);
  });

  it("returns raw value for non-number inputs", () => {
    expect(normalizeInputValue("text", "abc")).toBe("abc");
  });
});
