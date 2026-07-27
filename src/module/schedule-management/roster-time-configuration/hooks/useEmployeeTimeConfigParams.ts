"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { addDays, subDays } from "date-fns";

export const rosterParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
	activeTeam: "activeTeam",
	userId: "userId",
	employeeId: "employeeId",
	date: "date",
};

export type RosterParams = {
	startDate: Date;
	endDate: Date;
	activeTeam?: string;
	userId?: string;
	employeeId?: string;
	date?: string;
};

const getWeekRangeForDate = (date: Date): { startDate: Date; endDate: Date } => {
	const day = date.getDay(); // 0=Sun, 6=Sat
	const diffToSaturday = (day + 1) % 7;
	const startDate = subDays(date, diffToSaturday); // Saturday
	const endDate = addDays(startDate, 6); // Friday
	return { startDate, endDate };
};

export const useEmployeeTimeConfigParams = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const getParams = useMemo((): RosterParams => {
		const activeTeam = searchParams.get(rosterParamsKey.activeTeam) || undefined;
		const userId = searchParams.get(rosterParamsKey.userId) || undefined;
		const employeeId = searchParams.get(rosterParamsKey.employeeId) || undefined;
		const paramStartDate = searchParams.get(rosterParamsKey.startDate);
		const paramEndDate = searchParams.get(rosterParamsKey.endDate);
		const date = searchParams.get(rosterParamsKey.date) || undefined;

		if (paramStartDate && paramEndDate) {
			return {
				activeTeam,
				userId,
				employeeId,
				startDate: new Date(paramStartDate),
				endDate: new Date(paramEndDate),
			};
		}

		// Default: current Sat–Fri
		const { startDate, endDate } = getWeekRangeForDate(date ? new Date(date) : new Date());
		return { activeTeam, userId, employeeId, startDate, endDate };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.toString()]);

	const setParams = (
		params: Partial<Omit<RosterParams, "startDate" | "endDate">> & { startDate?: Date },
		persistPreviousParams = true
	) => {
		const previous = getParams;
		const newParams = new URLSearchParams();

		const finalParams = persistPreviousParams ? { ...previous, ...params } : params;

		if (finalParams.activeTeam !== undefined) {
			newParams.set(rosterParamsKey.activeTeam, finalParams.activeTeam);
		}

		if (finalParams.userId !== undefined) {
			newParams.set(rosterParamsKey.userId, finalParams.userId);
		}

		if (finalParams.employeeId !== undefined) {
			newParams.set(rosterParamsKey.employeeId, finalParams.employeeId);
		}

		const weekRange = getWeekRangeForDate(finalParams.startDate ?? previous.startDate ?? new Date());

		newParams.set(rosterParamsKey.startDate, weekRange.startDate.toISOString());
		newParams.set(rosterParamsKey.endDate, weekRange.endDate.toISOString());

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	return { getParams, setParams };
};
