"use client";
import React, { createContext, useContext } from "react";
import { IEmployeeJobContext } from "../types";
import { useEmployeeSchedules } from "@/module/job/hooks/useEmployeeSchedule";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { dateToUTCString } from "@/lib/utils/date";

const EmployeeJobContext = createContext<IEmployeeJobContext | undefined>(undefined);

export const EmployeeJobProvider = ({ children }: { children: React.ReactNode }) => {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const { data, refetch, isLoading } = useEmployeeSchedules({ startDate: dateToUTCString(startDate) });

	return (
		<EmployeeJobContext.Provider value={{ jobs: data || [], isJobLoading: isLoading, refetchJobs: refetch }}>
			{children}
		</EmployeeJobContext.Provider>
	);
};

export const useEmployeeJobContext = () => {
	const context = useContext(EmployeeJobContext);
	if (!context) {
		throw new Error("useEmployeeJobContext must be used within an EmployeeJobProvider");
	}
	return context;
};
