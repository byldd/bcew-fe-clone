import React from "react";
import { holidayTypes } from "@/module/schedule-management/weekly-schedule-management/utils/enums";
import { IHolidayConfiguration } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { getTodayDate, isSameDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export default function HolidayBanner({ holiday }: { holiday: IHolidayConfiguration }) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	if (!holiday) return null;

	const isEarlyRelease = holiday.name?.toLowerCase() === holidayTypes.EARLY_RELEASE;
	const isLateStart = holiday.name?.toLowerCase() === holidayTypes.LATE_START;

	const showBanner = isEarlyRelease || isLateStart;
	const isToday = isSameDate(toDate(holiday.date), toDate(getTodayDate()));

	if (!showBanner) return null;

	const label = isEarlyRelease
		? `${isToday ? "Today is " : toFormattedDate(holiday.date, DATE_FORMAT.MM_DD_YYYY)} scheduled for Early Release: ${toFormattedDate(holiday.endTime, DATE_FORMAT.HH_MM_AA_PM)}`
		: `${isToday ? "Today is " : toFormattedDate(holiday.date, DATE_FORMAT.MM_DD_YYYY)} scheduled for Late Start: ${toFormattedDate(holiday.startTime, DATE_FORMAT.HH_MM_AA_PM)}`;

	return (
		<div className="rounded-[10px] border border-brand-dark10 bg-brand-bgLightgrey04 px-4 pb-4 pt-6 text-start text-sm text-brand-dark">
			<p className="font-inter text-sm font-medium text-brand-dark">{label}</p>
			{holiday.note && (
				<p className="text-start text-[10px] font-normal text-brand-dark80">
					<span className="text-[10px] font-medium text-brand-dark">{tEmployee.note}: </span>
					{holiday.note}
				</p>
			)}
		</div>
	);
}
