"use client";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { toDate } from "@/lib/utils/date";
import { useScheduleWeekendReminder } from "@/module/job/hooks/useEmployeeSchedule";
import { WeekdayShort } from "../enums/weekend-type";

const REMINDER_COPY = {
	MON: {
		title: (day: string) => `${day} Work Reminder`,
		description: (day: string) => (
			<>
				You&apos;re scheduled for <span className="text-brand-dark">{day} work</span> this week, and this message is to
				make sure you&apos;re aware and prepared ahead of time.
			</>
		),
		claim: "Understood",
	},

	THU: {
		title: (day: string) => `Upcoming ${day} Shift`,
		description: (day: string) => (
			<>
				You&apos;re scheduled for <span className="text-brand-dark">{day} work</span> this week. Here&apos;s a reminder
				to keep you informed and ready going into the weekend.
			</>
		),
		claim: "Understood",
	},

	FRI: {
		title: (day: string) => `${day} Work `,
		description: (day: string) => (
			<>
				You&apos;re scheduled to work on <span className="text-brand-dark">{day}</span>. We&apos;re sharing this now so
				you can finish your day fully informed.
			</>
		),
		claim: "Got it",
	},
};

const getReminderContent = ({
	phase,
	isSaturday,
	isSunday,
}: {
	phase: keyof typeof REMINDER_COPY;
	isSaturday: boolean | undefined;
	isSunday: boolean | undefined;
}) => {
	const days: string[] = [];

	if (!isSaturday && !isSunday) {
		return;
	}

	if (isSaturday) days.push(WeekdayShort.SAT);
	if (isSunday) days.push(WeekdayShort.SUN);

	const dayLabel = days.length === 2 ? `${WeekdayShort.SAT} and ${WeekdayShort.SUN}` : days[0];

	return {
		title: REMINDER_COPY[phase].title(dayLabel || WeekdayShort.SAT),
		description: REMINDER_COPY[phase].description(dayLabel || WeekdayShort.SAT),
		claim: REMINDER_COPY[phase].claim,
	};
};

export function SaturdayReminderModal({
	phase,
	onClose,
	isSunday,
	isSaturday,
}: {
	phase: keyof typeof REMINDER_COPY;
	onClose: () => void;
	isSunday: boolean | undefined;
	isSaturday: boolean | undefined;
}) {
	const { mutate: updateWeekendReminder, isPending } = useScheduleWeekendReminder();

	const content = getReminderContent({
		phase,
		isSaturday,
		isSunday,
	});

	const handleClose = () => {
		updateWeekendReminder(
			{ payload: { startDate: toDate(new Date()), isSaturday, isSunday } },
			{
				onSuccess: () => {
					openSuccessToast("Reminder acknowledged successfully.");
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div>
			<h2 className="font-inter text-xl font-normal text-brand-dark">{content?.title}</h2>
			<p className="mt-2 font-inter text-sm font-medium text-brand-dark60">{content?.description}</p>
			<Button loading={isPending} variant="filled" className="mt-6 w-full" onClick={handleClose}>
				{content?.claim}
			</Button>
		</div>
	);
}
