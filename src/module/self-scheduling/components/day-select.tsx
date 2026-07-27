import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { dateToUTCString, isSameDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { getSecondMonday, getWeekendDatesForSelfSchedule } from "../utils/helpers";
import { Trash } from "lucide-react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const DaySelect = ({
	selectedDate,
	onSelectDate,
	onRemoveRow,
	index,
}: {
	selectedDate: string | null;
	onSelectDate: (date: string | null) => void;
	onRemoveRow?: () => void;
	index: number;
}) => {
	const { saturdays, sundays } = getWeekendDatesForSelfSchedule(new Date());
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const isDisabled = (date: Date) => !!selectedDate && !isSameDate(selectedDate, date);

	const onChange = (date: Date) => {
		const alreadySelected = selectedDate && isSameDate(selectedDate, date);
		if (alreadySelected) {
			onSelectDate(null);
			return;
		}
		onSelectDate(dateToUTCString(date));
	};

	return (
		<div className="relative">
			<div className="mb-2 grid grid-cols-2 gap-10">
				<p className="text-sm font-medium text-brand-grey">{tschedule.saturday}</p>
				<p className="text-sm font-medium text-brand-grey">{tschedule.sunday}</p>
			</div>

			{/* Date Rows */}
			{saturdays.map((saturday, index) => {
				const sunday = sundays[index];
				if (!saturday || !sunday) return null;

				return (
					<div key={index} className="grid grid-cols-2 gap-10 space-y-2">
						{/* Saturday */}
						<div className="flex items-center gap-2">
							<Checkbox
								checked={!!selectedDate && isSameDate(selectedDate, toDate(saturday))}
								disabled={isDisabled(saturday)}
								onCheckedChange={() => onChange(saturday)}
							/>
							<Label className="text-sm">{toFormattedDate(saturday)}</Label>
						</div>

						{/* Sunday */}
						<div className="flex items-center gap-2">
							<Checkbox
								checked={!!selectedDate && isSameDate(selectedDate, sunday)}
								disabled={isDisabled(sunday)}
								onCheckedChange={() => onChange(sunday)}
							/>
							<Label className="text-sm">{toFormattedDate(sunday)}</Label>
						</div>
					</div>
				);
			})}
			{selectedDate && (
				<p className="my-2 text-sm text-brand-yellow600">
					{tschedule.logTimeTillDay} {toFormattedDate(getSecondMonday(toDate(selectedDate)))} {tschedule.beforeTime}
				</p>
			)}

			{index > 0 && (
				<div className="absolute right-10 top-0">
					<Trash className="text-brand-red" size={16} onClick={onRemoveRow} />
				</div>
			)}
		</div>
	);
};

export default DaySelect;
