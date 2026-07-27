import { FORM_MODE } from "@/types";
import { IWeekScheduleResponse } from "./schedule-interface";

export interface IAddEmployeeToDailyJobPayload {
	employeeId: string;
	dailyJobId: string;
}

export type ICreateSpecialJobModalProps = {
	mode: FORM_MODE.CREATE;
	date: Date;
};

export type IUpdateSpecialJobModalProps = {
	mode: FORM_MODE.EDIT;
	dailyJobId: string;
};

export type ISpecialJobModalProps = (ICreateSpecialJobModalProps | IUpdateSpecialJobModalProps) & {
	closeModal: () => void;
	specialJob: Pick<IWeekScheduleResponse["specialJobs"][number], "id" | "name" | "teams" | "specialJobZones">;
};

export type IJoEmployeeOptions = {
	employeeId: string;
	label: string;
	employeeName: string;
	disabled: boolean;
};
