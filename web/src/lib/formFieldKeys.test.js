import { describe, expect, it } from "vitest";
import { getFieldValueKey } from "./formFieldKeys";

describe("getFieldValueKey", () => {
  it("maps relation object field to foreign key name", () => {
    const relationField = {
      name: "warehouse",
      kind: "object",
      isList: false,
    };

    expect(getFieldValueKey(relationField)).toBe("warehouseId");
  });

  it("keeps scalar field key unchanged", () => {
    const scalarField = {
      name: "name",
      kind: "scalar",
      isList: false,
    };

    expect(getFieldValueKey(scalarField)).toBe("name");
  });

  it("keeps already-foreign-key relation name unchanged", () => {
    const relationIdField = {
      name: "performedById",
      kind: "object",
      isList: false,
    };

    expect(getFieldValueKey(relationIdField)).toBe("performedById");
  });
});
