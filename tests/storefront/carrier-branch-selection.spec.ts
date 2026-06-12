import { describe, expect, it } from "vitest";

import {
  getCarrierBranchId,
  resolveCarrierBranchSelectionId,
  resolvePreferredCarrierBranch,
  type PreferredCarrierBranchSelection,
} from "@/lib/shipping/carrier-branch-selection";
import type { StorefrontCarrierBranch } from "@/lib/types/storefront";

const ROSARIO_CENTRO: StorefrontCarrierBranch = {
  branchId: "AND-ROS-001",
  name: "Rosario Centro",
  address: "San Martín 2127",
  city: "Rosario",
  province: "Santa Fe",
  postalCode: "2000",
};

const ROSARIO_SUR: StorefrontCarrierBranch = {
  branchId: "AND-ROS-002",
  name: "Rosario Sur",
  address: "Ovidio Lagos 1234",
  city: "Rosario",
  province: "Santa Fe",
  postalCode: "2000",
};

const PREFERRED_SELECTION: PreferredCarrierBranchSelection = {
  optionId: "andreani:branch:standard",
  destinationPostalCode: "2000",
  branch: ROSARIO_CENTRO,
};

describe("carrier branch selection", () => {
  it("mantiene la sucursal preferida mientras se rehidrata la cotización", () => {
    expect(
      resolvePreferredCarrierBranch(
        {
          optionId: "andreani:branch:standard",
          destinationPostalCode: "2000",
        },
        null,
        PREFERRED_SELECTION,
      ),
    ).toEqual(ROSARIO_CENTRO);
  });

  it("no reaplica una sucursal de otra opción o de otro código postal", () => {
    expect(
      resolvePreferredCarrierBranch(
        {
          optionId: "andreani:branch:premium",
          destinationPostalCode: "2000",
        },
        null,
        PREFERRED_SELECTION,
      ),
    ).toBeNull();

    expect(
      resolvePreferredCarrierBranch(
        {
          optionId: "andreani:branch:standard",
          destinationPostalCode: "5000",
        },
        null,
        PREFERRED_SELECTION,
      ),
    ).toBeNull();
  });

  it("vuelve a seleccionar la sucursal coincidente cuando Andreani devuelve el listado", () => {
    expect(
      resolveCarrierBranchSelectionId(
        [ROSARIO_SUR, ROSARIO_CENTRO],
        {
          optionId: "andreani:branch:standard",
          destinationPostalCode: "2000",
        },
        PREFERRED_SELECTION,
      ),
    ).toBe(getCarrierBranchId(ROSARIO_CENTRO));
  });

  it("autoselecciona la única sucursal disponible cuando no hay preferencia previa", () => {
    expect(
      resolveCarrierBranchSelectionId(
        [ROSARIO_SUR],
        {
          optionId: "andreani:branch:standard",
          destinationPostalCode: "2000",
        },
        null,
      ),
    ).toBe(getCarrierBranchId(ROSARIO_SUR));
  });
});
