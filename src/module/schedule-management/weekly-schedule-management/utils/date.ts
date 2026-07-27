export const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type WeekdayShort = (typeof weekdayShort)[number];
type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function getDateInfo(
	date: Date,
	todayDate: Date = new Date()
): { dayNum: number; dayName: WeekdayShort; isToday: boolean } {
	const dayNum = date.getDate();
	const dayIndex = date.getDay() as DayIndex;
	const dayName = weekdayShort[dayIndex]!;

	const normalizedDate = new Date(date);
	normalizedDate.setHours(0, 0, 0, 0);
	const normalizedToday = new Date(todayDate);
	normalizedToday.setHours(0, 0, 0, 0);

	const isToday = normalizedDate.getTime() === normalizedToday.getTime();

	return { dayNum, dayName, isToday };
}

export const getPayrollWeekRange = (today: Date) => {
	const day = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

	// Find last completed Friday
	let daysBackToFriday;

	if (day === 5) {
		// Today is Friday → go back 7 days
		daysBackToFriday = 7;
	} else if (day > 5) {
		// Saturday
		daysBackToFriday = day - 5;
	} else {
		// Sunday → Thursday
		daysBackToFriday = day + 2;
	}

	const weekEnd = new Date(today);
	weekEnd.setDate(today.getDate() - daysBackToFriday);

	const weekStart = new Date(weekEnd);
	weekStart.setDate(weekEnd.getDate() - 6);

	return {
		weekStart,
		weekEnd,
	};
};
