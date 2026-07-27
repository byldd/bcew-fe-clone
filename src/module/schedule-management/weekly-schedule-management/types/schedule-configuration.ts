import { z } from "zod";

export enum E_WEEKEND_WORKING_MODE {
	VOLUNTARY = "VOLUNTARY",
	MANDATORY = "MANDATORY",
	NOT_WORKING = "NOT_WORKING",
}

export interface IScheduleConfiguration {
	id: string;
	isSaturdayWorking: boolean;
	isSundayWorking: boolean;
	saturdayWorkingMode: E_WEEKEND_WORKING_MODE;
	sundayWorkingMode: E_WEEKEND_WORKING_MODE;
	dayStartTime: string;
	dayEndTime: string;
	dayConfigFrom: Date;
	dayConfigTo: Date;
	dayCongigNote?: string;
}

export type IUpdateScheduleDayTimeConfiguration = Pick<
	IScheduleConfiguration,
	"dayCongigNote" | "dayStartTime" | "dayEndTime"
> & {
	dayConfigFrom: string;
	dayConfigTo: string;
};

export type IUpdateScheduleConfiguration = Pick<
	IScheduleConfiguration,
	"isSaturdayWorking" | "isSundayWorking" | "saturdayWorkingMode" | "sundayWorkingMode"
> & {
	saturdayWorkingUsersIds: string[];
	sundayWorkingUsersIds: string[];
	specialJobs: (Omit<ISpecialJob, "id"> & { id?: string })[];
};

export interface ISpecialJob {
	id: string;
	name: string;
	isVisible: boolean;
	isDeleted: boolean;
	sequence: number;
	teams?: ISpecialJobTeam[];
}

export type IGetSpecialJobsResponse = (ISpecialJob & {
	specialJobZones?: (ISpecialJobZone & { zone: IBylddZone })[];
})[];

export interface ISpecialJobZone {
	specialJobId: string;
	zoneGeoTabId: string;
	isCurrent: boolean;
}

export type IBylddZone = {
	geoTabId: string;
	name: string;
	address?: string;
};

export interface ISpecialJobTeam {
	id: string;
	teamId: string;
	specialJobId: string;
}

export interface IHolidayConfiguration {
	id?: string;
	type: string;
	name: string;
	displayName?: string;
	date: string;
	note: string;
	startTime: string;
	endTime: string;
}

export const specialDay = z.object({
	name: z.string().nonempty("Required field"),
	displayName: z.string(),
	date: z.date(),
	type: z.string().nonempty("Required field"),
	note: z.string().nonempty("Required field"),
	startTime: z.string(),
	endTime: z.string(),
});

export type ISpecialDayFormValues = z.infer<typeof specialDay>;

export interface IExtremeWeatherFormProps {
	onCancel: () => void;
	holidayData: IHolidayConfiguration | null;
}
