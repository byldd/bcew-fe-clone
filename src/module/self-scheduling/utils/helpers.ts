import { WEEK_DAY_NUMBERS } from "@/utils/enums";
import { nextMonday, addDays, differenceInCalendarDays, isSaturday, isSunday } from "date-fns";

export function getWeekendDatesForSelfSchedule(date: Date) {
	const day = date.getDay();
	const hours = date.getHours();
	const minutes = date.getMinutes();

	const isMonday = day === WEEK_DAY_NUMBERS.MONDAY;
	const isSaturday = day === WEEK_DAY_NUMBERS.SATURDAY;
	const isSunday = day === WEEK_DAY_NUMBERS.SUNDAY;

	const isBeforeNoonMonday = isMonday && (hours < 11 || (hours === 11 && minutes <= 59));

	// get Saturday of BCEW week
	const getSaturday = (date: Date) => {
		const d = new Date(date);
		const diff = (d.getDay() - WEEK_DAY_NUMBERS.SATURDAY + 7) % 7;
		d.setDate(d.getDate() - diff);
		return d;
	};

	const currentWeekSaturday = getSaturday(date);

	const previousSaturday = new Date(currentWeekSaturday);
	previousSaturday.setDate(previousSaturday.getDate() - 7);

	const twoWeeksAgoSaturday = new Date(currentWeekSaturday);
	twoWeeksAgoSaturday.setDate(twoWeeksAgoSaturday.getDate() - 14);

	const nextSaturday = new Date(currentWeekSaturday);
	nextSaturday.setDate(nextSaturday.getDate() + 7);

	const buildWeekend = (saturday: Date) => {
		const sunday = new Date(saturday);
		sunday.setDate(saturday.getDate() + 1);
		return { saturday, sunday };
	};

	let firstWeekend;
	let secondWeekend;

	// Monday before 11:59 AM → ONLY past weekends
	if (isBeforeNoonMonday) {
		firstWeekend = buildWeekend(twoWeeksAgoSaturday);
		secondWeekend = buildWeekend(previousSaturday);
	}

	// Saturday / Sunday → last + current
	else if (isSaturday || isSunday) {
		firstWeekend = buildWeekend(previousSaturday);
		secondWeekend = buildWeekend(currentWeekSaturday);
	}

	// Monday after or Tuesday-Friday → last + next
	else {
		firstWeekend = buildWeekend(currentWeekSaturday);
		secondWeekend = buildWeekend(nextSaturday);
	}

	return {
		saturdays: [firstWeekend.saturday, secondWeekend.saturday],
		sundays: [firstWeekend.sunday, secondWeekend.sunday],
	};
}

export function getDaysToSecondMonday(selectedDate: Date) {
	if (!isSaturday(selectedDate) && !isSunday(selectedDate)) {
		return 0;
	}

	// first upcoming Monday
	const firstMonday = nextMonday(selectedDate);

	// second Monday = +7 days
	const secondMonday = addDays(firstMonday, 7);

	return differenceInCalendarDays(secondMonday, selectedDate);
}

export function getSecondMonday(selectedDate: Date) {
	if (!isSaturday(selectedDate) && !isSunday(selectedDate)) {
		return selectedDate;
	}

	return addDays(nextMonday(selectedDate), 7);
}
