import type { StorefrontCarrierBranch } from "@/lib/types/storefront";

export type CarrierBranchSelectionContext = {
  optionId: string;
  destinationPostalCode: string;
};

export type PreferredCarrierBranchSelection = CarrierBranchSelectionContext & {
  branch: StorefrontCarrierBranch;
};

export function getCarrierBranchId(branch: StorefrontCarrierBranch): string {
  const code = typeof branch.code === "string" ? branch.code : undefined;
  return branch.branchId ?? branch.id ?? code ?? branch.name;
}

function matchesPreferredSelectionContext(
  selectedOption: CarrierBranchSelectionContext | null,
  preferredSelection: PreferredCarrierBranchSelection | null,
): preferredSelection is PreferredCarrierBranchSelection {
  if (!selectedOption || !preferredSelection) {
    return false;
  }

  return (
    preferredSelection.optionId === selectedOption.optionId &&
    preferredSelection.destinationPostalCode === selectedOption.destinationPostalCode
  );
}

export function resolvePreferredCarrierBranch(
  selectedOption: CarrierBranchSelectionContext | null,
  selectedCarrierBranch: StorefrontCarrierBranch | null,
  preferredSelection: PreferredCarrierBranchSelection | null,
): StorefrontCarrierBranch | null {
  if (selectedCarrierBranch) {
    return selectedCarrierBranch;
  }

  if (!matchesPreferredSelectionContext(selectedOption, preferredSelection)) {
    return null;
  }

  return preferredSelection.branch;
}

export function resolveCarrierBranchSelectionId(
  branches: StorefrontCarrierBranch[],
  selectedOption: CarrierBranchSelectionContext | null,
  preferredSelection: PreferredCarrierBranchSelection | null,
): string | null {
  const preferredBranch = resolvePreferredCarrierBranch(
    selectedOption,
    null,
    preferredSelection,
  );

  if (preferredBranch) {
    const matchedBranch = branches.find(
      (branch) => getCarrierBranchId(branch) === getCarrierBranchId(preferredBranch),
    );

    if (matchedBranch) {
      return getCarrierBranchId(matchedBranch);
    }
  }

  const onlyBranch = branches[0];
  return branches.length === 1 && onlyBranch ? getCarrierBranchId(onlyBranch) : null;
}
