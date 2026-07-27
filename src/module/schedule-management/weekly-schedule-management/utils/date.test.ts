import { describe, it, expect } from "vitest";
import { getPayrollWeekRange } from "./date";

// Helper to create a date at midnight UTC
const makeUtcDate = (year: number, month: number, day: number) => {
	const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
	return date;
};

// Helper to format date for easier debugging
const formatDate = (date: Date) => {
	return date.toISOString().split("T")[0];
};

describe("getPayrollWeekRange", () => {
	it("returns previous week when today is Friday", () => {
		// Today: Friday, Jan 12, 2024
		const today = makeUtcDate(2024, 1, 12);

		const result = getPayrollWeekRange(today);

		// Last Friday: Jan 5, 2024
		// Week start: Dec 30, 2023 (Jan 5 - 6 days)
		expect(formatDate(result.weekStart)).toBe("2023-12-30");
		expect(formatDate(result.weekEnd)).toBe("2024-01-05");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("returns previous week when today is Saturday", () => {
		// Today: Saturday, Jan 13, 2024
		const today = makeUtcDate(2024, 1, 13);

		const result = getPayrollWeekRange(today);

		expect(formatDate(result.weekStart)).toBe("2024-01-06");
		expect(formatDate(result.weekEnd)).toBe("2024-01-12");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("returns previous week when today is Sunday", () => {
		// Today: Sunday, Jan 14, 2024
		const today = makeUtcDate(2024, 1, 14);

		const result = getPayrollWeekRange(today);

		expect(formatDate(result.weekStart)).toBe("2024-01-06");
		expect(formatDate(result.weekEnd)).toBe("2024-01-12");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("returns previous week when today is Monday (example case)", () => {
		// Today: Monday, Jan 8, 2024
		const today = makeUtcDate(2024, 1, 8);

		const result = getPayrollWeekRange(today);

		// Last Friday: Jan 5, 2024
		// Week start: Dec 30, 2023
		expect(formatDate(result.weekStart)).toBe("2023-12-30");
		expect(formatDate(result.weekEnd)).toBe("2024-01-05");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("returns previous week when today is Tuesday", () => {
		// Today: Tuesday, Jan 9, 2024
		const today = makeUtcDate(2024, 1, 9);

		const result = getPayrollWeekRange(today);

		// Last Friday: Jan 5, 2024
		// Week start: Dec 30, 2023
		expect(formatDate(result.weekStart)).toBe("2023-12-30");
		expect(formatDate(result.weekEnd)).toBe("2024-01-05");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("returns previous week when today is Wednesday", () => {
		// Today: Wednesday, Jan 10, 2024
		const today = makeUtcDate(2024, 1, 10);

		const result = getPayrollWeekRange(today);

		// Last Friday: Jan 5, 2024
		// Week start: Dec 30, 2023
		expect(formatDate(result.weekStart)).toBe("2023-12-30");
		expect(formatDate(result.weekEnd)).toBe("2024-01-05");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("returns previous week when today is Thursday", () => {
		// Today: Thursday, Jan 11, 2024
		const today = makeUtcDate(2024, 1, 11);

		const result = getPayrollWeekRange(today);

		// Last Friday: Jan 5, 2024
		// Week start: Dec 30, 2023
		expect(formatDate(result.weekStart)).toBe("2023-12-30");
		expect(formatDate(result.weekEnd)).toBe("2024-01-05");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("handles month boundary correctly (week spans two months)", () => {
		// Today: Monday, Feb 5, 2024
		const today = makeUtcDate(2024, 2, 5);

		const result = getPayrollWeekRange(today);

		// Last Friday: Feb 2, 2024
		// Week start: Jan 27, 2024 (Feb 2 - 6 days)
		expect(formatDate(result.weekStart)).toBe("2024-01-27");
		expect(formatDate(result.weekEnd)).toBe("2024-02-02");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("handles year boundary correctly (week spans two years)", () => {
		// Today: Monday, Jan 1, 2024
		const today = makeUtcDate(2024, 1, 1);

		const result = getPayrollWeekRange(today);

		// Last Friday: Dec 29, 2023
		// Week start: Dec 23, 2023 (Dec 29 - 6 days)
		expect(formatDate(result.weekStart)).toBe("2023-12-23");
		expect(formatDate(result.weekEnd)).toBe("2023-12-29");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("handles leap year correctly", () => {
		// Today: Monday, Mar 4, 2024 (leap year)
		const today = makeUtcDate(2024, 3, 4);

		const result = getPayrollWeekRange(today);

		// Last Friday: Mar 1, 2024
		// Week start: Feb 24, 2024 (Mar 1 - 6 days, accounting for Feb 29)
		expect(formatDate(result.weekStart)).toBe("2024-02-24");
		expect(formatDate(result.weekEnd)).toBe("2024-03-01");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("returns correct week when today is exactly one week after previous Friday", () => {
		// Today: Friday, Jan 19, 2024
		const today = makeUtcDate(2024, 1, 19);

		const result = getPayrollWeekRange(today);

		// Last Friday: Jan 12, 2024
		// Week start: Jan 6, 2024 (Jan 12 - 6 days)
		expect(formatDate(result.weekStart)).toBe("2024-01-06");
		expect(formatDate(result.weekEnd)).toBe("2024-01-12");
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("always returns weekStart as Saturday and weekEnd as Friday", () => {
		const testDates = [
			makeUtcDate(2024, 1, 1), // Monday
			makeUtcDate(2024, 1, 5), // Friday
			makeUtcDate(2024, 1, 6), // Saturday
			makeUtcDate(2024, 1, 7), // Sunday
			makeUtcDate(2024, 6, 15), // Saturday
			makeUtcDate(2024, 12, 25), // Wednesday (Christmas)
		];

		testDates.forEach((today) => {
			const result = getPayrollWeekRange(today);
			expect(result.weekStart.getDay()).toBe(6); // Saturday
			expect(result.weekEnd.getDay()).toBe(5); // Friday
		});
	});

	it("returns weekEnd that is always 6 days after weekStart", () => {
		const testDates = [
			makeUtcDate(2024, 1, 8), // Monday
			makeUtcDate(2024, 2, 14), // Wednesday
			makeUtcDate(2024, 7, 4), // Thursday
		];

		testDates.forEach((today) => {
			const result = getPayrollWeekRange(today);
			const diffTime = result.weekEnd.getTime() - result.weekStart.getTime();
			const diffDays = diffTime / (1000 * 60 * 60 * 24);
			expect(diffDays).toBe(6);
		});
	});

	it("returns weekEnd that is always in the past (not today or future)", () => {
		const testDates = [
			makeUtcDate(2024, 1, 8), // Monday
			makeUtcDate(2024, 1, 12), // Friday
			makeUtcDate(2024, 1, 13), // Saturday
		];

		testDates.forEach((today) => {
			const result = getPayrollWeekRange(today);
			expect(result.weekEnd.getTime()).toBeLessThanOrEqual(today.getTime());
			expect(result.weekStart.getTime()).toBeLessThan(today.getTime());
		});
	});

	it("handles edge case at end of month (January 31)", () => {
		// Today: Monday, Feb 5, 2024
		const today = makeUtcDate(2024, 2, 5);

		const result = getPayrollWeekRange(today);

		// Should correctly handle month boundary
		expect(result.weekStart.getMonth()).toBe(0); // January
		expect(result.weekEnd.getMonth()).toBe(1); // February
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});

	it("handles edge case at beginning of month (March 1)", () => {
		// Today: Monday, Mar 4, 2024
		const today = makeUtcDate(2024, 3, 4);

		const result = getPayrollWeekRange(today);

		// Should correctly handle month boundary
		expect(result.weekStart.getMonth()).toBe(1); // February
		expect(result.weekEnd.getMonth()).toBe(2); // March
		expect(result.weekStart.getDay()).toBe(6); // Saturday
		expect(result.weekEnd.getDay()).toBe(5); // Friday
	});
});
