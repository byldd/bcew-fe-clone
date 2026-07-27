"use client";
import { useState } from "react";
import { addDays, subDays } from "date-fns";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useRouter } from "next/navigation";

export const useReleaseNoteDate = () => {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const router = useRouter();

	const formattedDate = toFormattedDate(selectedDate, DATE_FORMAT.MM_SLASH_DD_YYYY);
	const apiDate = toFormattedDate(selectedDate, DATE_FORMAT.YYYY_MM_DD);

	const goToPrevDay = () => {
		setSelectedDate((prev) => subDays(prev, 1));
		router.replace(window.location.pathname, { scroll: false });
	};

	const goToNextDay = () => {
		setSelectedDate((prev) => addDays(prev, 1));
		router.replace(window.location.pathname, { scroll: false });
	};

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);
		setIsCalendarOpen(false);
		router.replace(window.location.pathname, { scroll: false });
	};

	return {
		selectedDate,
		formattedDate,
		apiDate,
		isCalendarOpen,
		setIsCalendarOpen,
		goToPrevDay,
		goToNextDay,
		handleDateSelect,
	};
};
