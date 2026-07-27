import { DELIVERY_STATUS_STEP } from "../enums";

// Display-only inference — some legacy BCEW rows leave "loaded" unset even
// when later steps are done, so infer forward from whatever's actually set.
export function inferCompletedSteps(steps: string[]): Set<DELIVERY_STATUS_STEP> {
	const completed = new Set(steps as DELIVERY_STATUS_STEP[]);

	if (completed.has(DELIVERY_STATUS_STEP.VALIDATED)) {
		completed.add(DELIVERY_STATUS_STEP.LOADED);
	}

	if (completed.has(DELIVERY_STATUS_STEP.DELIVERED)) {
		completed.add(DELIVERY_STATUS_STEP.ORDERED);
		completed.add(DELIVERY_STATUS_STEP.PULLED);
		completed.add(DELIVERY_STATUS_STEP.VALIDATED);
		completed.add(DELIVERY_STATUS_STEP.LOADED);
		completed.add(DELIVERY_STATUS_STEP.DELIVERY_CONFIRMATION);
	}

	return completed;
}
