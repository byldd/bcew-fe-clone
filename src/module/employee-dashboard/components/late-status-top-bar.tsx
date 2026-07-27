"use client";
import React from "react";
import { cn } from "@/lib/utils/utils";
import {
	AttendanceStatus,
	IEmployeeDayTime,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { OptionYesNo } from "@/utils/enums";

export default function LateStatusTopBar({ employeeDayTime }: { employeeDayTime: IEmployeeDayTime }) {
	if (employeeDayTime?.lateStatus === AttendanceStatus.ACCEPTED) {
		return null; // HIDE
	}

	if (employeeDayTime?.lateStatus === AttendanceStatus.REJECTED) {
		return (
			<div
				className={cn(
					"w-full rounded bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				Your not-late request was rejected by admin.
			</div>
		);
	}

	if (employeeDayTime?.isLatenessHandled && !employeeDayTime?.lateStatus) {
		return (
			<div
				className={cn(
					"w-full rounded border-brand-red800 bg-red-50 py-2 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				Lateness is reviewed by admin.
			</div>
		);
	}

	return (
		<div
			className={cn(
				"w-full rounded bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800"
			)}
		>
			{employeeDayTime?.lateResponse === OptionYesNo.NO
				? "Not-Late request was sent to admin for review."
				: employeeDayTime?.lateResponse === OptionYesNo.YES
					? "You were marked late today."
					: ""}
		</div>
	);
}
