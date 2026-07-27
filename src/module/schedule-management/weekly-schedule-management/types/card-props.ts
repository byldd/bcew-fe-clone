import { FORM_MODE } from "@/types";
import { SCHEDULE_ROW_TYPE } from "../constants/week-schedule";
import { IWeekScheduleResponse } from "./schedule-interface";
import { ISpecialJob } from "./schedule-configuration";

export type INoScheduleCardProps = {
	date: Date;
	bcewJob?: IWeekScheduleResponse["bcewJobs"][number];
	subContractorForecastDate?: Date | null;
	rowType: SCHEDULE_ROW_TYPE;
	dayType: string;
	specialJob?: IWeekScheduleResponse["specialJobs"][number];
};

export type INoScheduleFormProps = Pick<INoScheduleCardProps, "date" | "bcewJob" | "specialJob" | "rowType"> & {
	setIsEditing: (isEditing: boolean) => void;
};

export type ICardEmployeeFieldProps = Pick<INoScheduleCardProps, "specialJob" | "rowType" | "date" | "bcewJob">;

export type ISelectJobMemberProps = Pick<INoScheduleCardProps, "specialJob" | "rowType" | "date" | "bcewJob">;

export type IJobMembersFieldProps = {
	mode: FORM_MODE;
	canAddNewMember?: boolean;
	specialJob?: Pick<ISpecialJob, "id" | "name" | "teams">;
	readOnly?: boolean;
	bcewJob?: IWeekScheduleResponse["bcewJobs"][number];
};
