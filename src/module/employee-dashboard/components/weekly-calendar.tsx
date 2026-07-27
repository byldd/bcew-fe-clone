"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { generateWeek, getDayOfMonth, getTodayReminderPhase, isDateMatch } from "../utils";
import { Navigate } from "../utils/enums";
import { MdArrowLeft, MdArrowRight } from "react-icons/md";
import useAuthStore from "@/store/auth-store";
import { useScheduleWeekend } from "@/module/job/hooks/useEmployeeSchedule";
import { dateToUTCString, isSameDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { useModal } from "@/hooks/useModal";
import { SaturdayReminderModal } from "./saturday-reminder-modal";
import { add } from "date-fns";
import { isSmsConsentProvided } from "@/module/profile/utils/sms-consent";
import SmsConsent from "@/components/shared/sms-consent";
import { useGetScheduledates } from "../hooks/useSchedule";
import { DATE_FORMAT } from "@/types/date";

export function WeeklyCalendar({
	isEmployee,
	isTimeLogPending,
	date,
	onDateChange,
}: {
	isEmployee?: boolean;
	isTimeLogPending?: boolean | undefined;
	date?: string | undefined;
	onDateChange?: (date: string) => void;
}) {
	const { setParams, getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const [offset, setOffset] = useState(0);
	const [offsetDate, setOffsetDate] = useState(startDate);

	const { user, subcontractorCrew } = useAuthStore((state) => state);

	const { data: scheduleDates } = useGetScheduledates(dateToUTCString(offsetDate), !!isEmployee);

	const { data } = useScheduleWeekend(dateToUTCString(startDate), isEmployee);
	const { openModal, closeModal, Modal } = useModal();

	const weekDays = useMemo(() => {
		const days: Date[] = [];
		const maxIterations = 12;

		if (scheduleDates?.length) {
			let indexInScheduleDate = scheduleDates?.findIndex((schDate) => isSameDate(schDate, date || offsetDate));

			let iterations = 0;
			while (days.length < 7 && iterations < maxIterations) {
				const day = scheduleDates?.[indexInScheduleDate];
				if (day) {
					days.push(toDate(day));
				}
				indexInScheduleDate++;
				iterations++;
			}
			return days;
		}

		return generateWeek(date, offset);
	}, [scheduleDates, offsetDate, offset, date]);

	const handleNavigate = (direction: Navigate.PREV | Navigate.NEXT) => {
		setOffset((prev) => (direction === Navigate.PREV ? prev - 1 : prev + 1));
		setOffsetDate((prev) => {
			const indexInScheduleDate = scheduleDates?.findIndex((schDate) => isSameDate(schDate, prev));
			const nextDateInScheduleDates =
				scheduleDates?.[(indexInScheduleDate ?? 0) + (direction === Navigate.PREV ? -1 : 1)];

			const newDate =
				indexInScheduleDate &&
				scheduleDates &&
				scheduleDates?.length &&
				indexInScheduleDate > 1 &&
				nextDateInScheduleDates
					? nextDateInScheduleDates
					: add(prev, { days: direction === Navigate.PREV ? -1 : 1 });
			return toDate(newDate);
		});
	};

	const handleOpenWeekendReminder = () => {
		const { isCurrentWeekSaturday, isCurrentWeekSunday, weekendReminder } = data || {};
		if (!data || (!isCurrentWeekSaturday && !isCurrentWeekSunday)) return false;

		const phase = getTodayReminderPhase();
		if (!phase) return false;

		const today = toDate(new Date());

		const alreadyReadSaturday = isDateMatch(weekendReminder?.readSaturdayDate, today);
		const alreadyReadSunday = isDateMatch(weekendReminder?.readSundayDate, today);

		const shouldOpen = (isCurrentWeekSaturday && !alreadyReadSaturday) || (isCurrentWeekSunday && !alreadyReadSunday);

		if (!shouldOpen) return false;

		openModal({
			modalView: (
				<SaturdayReminderModal
					phase={phase}
					onClose={closeModal}
					isSaturday={isCurrentWeekSaturday}
					isSunday={isCurrentWeekSunday}
				/>
			),
		});

		return true;
	};

	useEffect(() => {
		handleOpenWeekendReminder();
	}, [data]);

	useEffect(() => {
		if (!user && !subcontractorCrew) return;
		if (!isSmsConsentProvided({ user, subcontractorCrew })) {
			openModal({
				modalView: <SmsConsent onClose={closeModal} showCloseButton={false} isSubCrew={!!subcontractorCrew} />,
				showDefaultClose: false,
			});
		} else {
			closeModal();
		}
	}, [user, subcontractorCrew, openModal, closeModal]);

	const hadnleDateChange = (date: Date) => {
		setParams({ startDate: date });
		onDateChange?.(dateToUTCString(date));
	};

	return (
		<div
			className={`fixed top-[72px] z-[2] w-full rounded-lg bg-brand-bgLightgrey ${isTimeLogPending ? "pointer-events-none opacity-50" : ""}`}
		>
			<div className="flex items-center justify-between py-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleNavigate(Navigate.PREV)}
					className="text-sm font-semibold"
				>
					<MdArrowLeft />
				</Button>
				<div className="flex flex-1 items-center justify-between space-x-2">
					{weekDays.map((day) => {
						const isSelected = isSameDate(toDate(startDate), toDate(day));
						const isToday = isSameDate(toDate(new Date()), toDate(day));
						return (
							<Button
								key={day.toDateString()}
								variant={isSelected ? "default" : "ghost"}
								className={cn(
									"flex h-14 w-10 flex-col gap-0 bg-white py-2 text-xs text-brand-dark50",
									isSelected &&
										"border border-brand-dark30 text-brand-dark shadow-[0px_6px_6px_0px_#1515153D,_0px_10px_20px_0px_#15151533]",
									isToday && "border-2 border-brand-dark"
								)}
								onClick={() => hadnleDateChange(day)}
							>
								<span className="text-[10px] font-normal text-brand-dark">{toFormattedDate(day, DATE_FORMAT.MMM)}</span>

								<span className="text-xs font-semibold leading-3">{getDayOfMonth(day)}</span>
								<span className="text-xs font-semibold">{toFormattedDate(day, DATE_FORMAT.HALF_WEEK_DAY)}</span>
							</Button>
						);
					})}
				</div>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleNavigate(Navigate.NEXT)}
					className="text-sm font-semibold"
				>
					<MdArrowRight />
				</Button>
			</div>
			<Modal />
		</div>
	);
}
