"use client";
import React from "react";
import { cn } from "@/lib/utils/utils";
import {
	AttendanceStatus,
	IEmployeeDayTime,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { OptionYesNo } from "@/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export default function EarlyStatusTopBar({ employeeDayTime }: { employeeDayTime: IEmployeeDayTime }) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	// Hide completely if accepted
	if (employeeDayTime?.earlyOutStatus === AttendanceStatus.ACCEPTED) {
		return null;
	}

	// Rejected case
	if (employeeDayTime?.earlyOutStatus === AttendanceStatus.REJECTED) {
		return (
			<div
				className={cn(
					"w-full rounded bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				Your early-quit request was rejected by admin.
			</div>
		);
	}

	if (employeeDayTime?.isEarlyOutHandled && !employeeDayTime?.earlyOutStatus) {
		return (
			<div
				className={cn(
					"w-full rounded border-brand-red800 bg-red-50 py-2 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				early-quit is reviewed by admin.
			</div>
		);
	}

	return (
		<div
			className={cn(
				"w-full rounded bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800"
			)}
		>
			{employeeDayTime?.earlyOutResponse === OptionYesNo?.NO
				? tEmployee.notLeftEarlyResponseSent
				: employeeDayTime?.earlyOutResponse === OptionYesNo?.YES
					? tEmployee.markedEarlyQuitToday
					: ""}
		</div>
	);
}
