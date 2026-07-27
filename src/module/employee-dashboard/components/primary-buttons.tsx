"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { openErrorToast } from "@/components/toast";
import { PrimaryButtonState } from "../utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { IPrimaryButtonsProps } from "../types";

export default function PrimaryButtons({
	state,
	disabled,
	onStart,
	onEnd,
	onFingerprint,
	isVehicleAssigned,
	todayRosterTimeAvailable,
}: IPrimaryButtonsProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	switch (state) {
		case PrimaryButtonState.UPDATE_LOGGED_TIME:
			return (
				<Button disabled={disabled} variant="filled" className="w-full px-2 text-xs" onClick={onEnd}>
					{tEmployee.updateLoggedTime}
				</Button>
			);

		case PrimaryButtonState.GPS_RESTRICTED:
			return (
				<Button
					disabled={disabled}
					variant="filled"
					className="w-full"
					onClick={() =>
						openErrorToast({
							message: tEmployee.restrictedGpsAutoStart,
						})
					}
				>
					{tEmployee.gpsTimer}
				</Button>
			);

		case PrimaryButtonState.FINGERPRINT_RESTRICTED:
			return (
				<Button disabled={disabled} variant="filled" className="w-full" onClick={onFingerprint}>
					Fingerprint Time
				</Button>
			);

		case PrimaryButtonState.MANUAL_LOG:
		default:
			return (
				<Button
					variant="filled"
					className="w-full"
					disabled={!todayRosterTimeAvailable}
					onClick={() => (isVehicleAssigned ? onEnd && onEnd() : onStart && onStart())}
				>
					{tEmployee.logMyTime}
				</Button>
			);
	}
}
