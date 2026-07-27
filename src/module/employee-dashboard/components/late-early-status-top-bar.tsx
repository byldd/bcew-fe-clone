"use client";
import React from "react";
import { cn } from "@/lib/utils/utils";
import {
	AttendanceStatus,
	IEmployeeDayTime,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { OptionYesNo } from "@/utils/enums";

export default function LateEarlyStatusTopBar({ employeeDayTime }: { employeeDayTime: IEmployeeDayTime }) {
	if (
		employeeDayTime?.lateStatus === AttendanceStatus.ACCEPTED &&
		employeeDayTime?.earlyOutStatus === AttendanceStatus.ACCEPTED
	)
		return null;

	if (
		employeeDayTime?.lateStatus === AttendanceStatus.REJECTED &&
		employeeDayTime?.earlyOutStatus === AttendanceStatus.REJECTED
	) {
		return (
			<div
				className={cn(
					"w-full rounded bg-brand-red800/10 py-2.5 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				Your not late arrival and early quit request was rejected by Admin.
			</div>
		);
	}

	if (
		employeeDayTime?.lateStatus === AttendanceStatus.ACCEPTED &&
		employeeDayTime?.earlyOutStatus === AttendanceStatus.REJECTED
	) {
		return (
			<div
				className={cn(
					"w-full rounded bg-brand-red800/10 py-2.5 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				Your not-late request was rejected by admin.
			</div>
		);
	}

	if (
		employeeDayTime?.earlyOutStatus === AttendanceStatus.ACCEPTED &&
		employeeDayTime?.lateStatus === AttendanceStatus.REJECTED
	) {
		return (
			<div
				className={cn(
					"w-full rounded bg-brand-red800/10 py-2.5 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				Your not-early-quit request was rejected by admin.
			</div>
		);
	}

	if (
		employeeDayTime?.isLatenessHandled &&
		employeeDayTime?.isEarlyOutHandled &&
		!employeeDayTime?.lateStatus &&
		!employeeDayTime?.earlyOutStatus
	) {
		return (
			<div
				className={cn(
					"w-full rounded border-brand-red800 bg-red-50 py-2 text-center font-inter text-xs font-medium text-brand-red800"
				)}
			>
				Lateness & early-quit is reviewed by admin.
			</div>
		);
	}

	const message =
		employeeDayTime?.lateResponse === OptionYesNo?.YES && employeeDayTime?.earlyOutResponse === OptionYesNo?.YES
			? "You were marked late start & early quit today!"
			: employeeDayTime?.lateResponse === OptionYesNo?.NO && employeeDayTime?.earlyOutResponse === OptionYesNo?.NO
				? "Your late arrival and early quit response have been sent to the admin for review."
				: employeeDayTime?.lateResponse === OptionYesNo?.YES && employeeDayTime?.earlyOutResponse === OptionYesNo?.NO
					? "You were marked late today. Your early quit response has been sent to the admin for review."
					: employeeDayTime?.lateResponse === OptionYesNo?.NO && employeeDayTime?.earlyOutResponse === OptionYesNo?.YES
						? "You left early today. Your late quit response has been sent to the admin for review."
						: "";

	if (!message) return null;

	return (
		<div
			className={cn(
				"w-full rounded bg-brand-red800/10 py-2.5 text-center font-inter text-xs font-medium text-brand-red800"
			)}
		>
			{message}
		</div>
	);
}
