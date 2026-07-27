"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pause } from "lucide-react";
import { formatTime } from "../utils";
import { apiClient } from "@/lib/api";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { calculatePausedDuration, getTimeFromISOString } from "../utils";
import { endPointEmployeeDayTime } from "../constants";
import { dateToUTCString } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { IEmployeeDayTime } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

export default function RunningTimer({
	disabled,
	isGPSTimeLogAllowed,
	onHandleTimerClick,
}: {
	disabled?: boolean;
	isGPSTimeLogAllowed?: boolean;
	onHandleTimerClick?: () => void;
}) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const [employeeDaytime, setEmployeeDaytime] = useState<IEmployeeDayTime | null>(null);
	const [elapsedTime, setElapsedTime] = useState<number>(0);
	const [isRunning, setIsRunning] = useState<boolean | undefined>(false);
	const timerIntervalRef = useRef<number | null>(null);

	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();

	const stableFilters = useMemo(() => ({ startDate: dateToUTCString(startDate) }), [startDate]);

	const fetchDaytime = useCallback(async () => {
		try {
			const { data } = await apiClient.get(endPointEmployeeDayTime, {
				params: stableFilters,
			});
			setEmployeeDaytime(data.data);
			const { dayStartTime, dayEndTime } = data.data || {};
			const isTimerRunning = dayStartTime && !dayEndTime ? true : false;
			setIsRunning(isTimerRunning);
			return data.data ?? null;
		} catch {
			return null;
		}
	}, [stableFilters]);

	const calculateElapsedFromDaytime = (daytime: IEmployeeDayTime | null) => {
		if (!daytime?.dayStartTime) return 0;
		const startTime = getTimeFromISOString(daytime.overrideStartTime || daytime.dayStartTime);
		const endTime = new Date().getTime();
		const totalPause = calculatePausedDuration(daytime.employeePauseTime);

		return Math.max(0, endTime - startTime - totalPause);
	};

	useEffect(() => {
		fetchDaytime();
	}, [stableFilters, fetchDaytime]);

	useEffect(() => {
		if (!employeeDaytime?.dayStartTime || employeeDaytime?.dayEndTime) return;

		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current as unknown as number);
			timerIntervalRef.current = null;
		}

		const updateElapsed = () => setElapsedTime(calculateElapsedFromDaytime(employeeDaytime));

		updateElapsed();

		if (isRunning) {
			timerIntervalRef.current = window.setInterval(updateElapsed, 1000) as unknown as number;
		}

		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current as unknown as number);
				timerIntervalRef.current = null;
			}
		};
	}, [employeeDaytime, isRunning]);

	return (
		<Button disabled={disabled} variant="filled" className="w-full" onClick={onHandleTimerClick}>
			{isGPSTimeLogAllowed ? (
				<>
					{!isRunning && elapsedTime !== 0 && <Pause />}
					{formatTime(Math.floor(elapsedTime / 1000))} hrs
				</>
			) : (
				tEmployee.logMyTime
			)}
		</Button>
	);
}
