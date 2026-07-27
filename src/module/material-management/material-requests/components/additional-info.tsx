import React from "react";
import { MaterialRequestRow } from "../utils/types";
import { PULL_LIST_CONFIRMATION } from "@/module/job/material-selection/utils/enums";
import { ScreenshotPreview } from "@/module/admin-technical-issues/components/screenshot-previews";

const normalizePullListConfirmation = (value: boolean | string | null | undefined) => {
	if (value === true) return PULL_LIST_CONFIRMATION.YES;
	if (value === false) return PULL_LIST_CONFIRMATION.NO;
	if (typeof value === "string") return value.toLowerCase();
	return null;
};

const AdditionalInformation = ({ row }: { row: MaterialRequestRow }) => {
	const { referenceId, workOrderNumber, pullListConfirmed, receivedInput, images } = row;
	const confirmation = normalizePullListConfirmation(pullListConfirmed);

	if (!referenceId && !workOrderNumber && !confirmation && !images.length && !receivedInput) {
		return <div>--</div>;
	}
	return (
		<div className="flex flex-col items-center space-y-1 text-center text-[10px] text-brand-dark50">
			{referenceId && <div>Ref ID: {referenceId}</div>}

			{workOrderNumber && <div>Work Order: {workOrderNumber}</div>}
			{receivedInput && <div>Received quantity: {receivedInput}</div>}
			<div>
				<ScreenshotPreview images={images} />
			</div>
		</div>
	);
};

export default AdditionalInformation;
