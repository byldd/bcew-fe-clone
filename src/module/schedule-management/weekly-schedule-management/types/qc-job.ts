import { IDepartment } from "@/module/crew/types";
import { DroppableCardProps, IEmployee, IUser, IWeekScheduleResponse } from "./schedule-interface";
import { FORM_MODE } from "@/types";

export type IDepartmentManager = {
	dptmnt: number;
	empnum: number;
};

export type IQcInspectionForeman = IDepartment & {
	deptManager: IDepartmentManager & {
		employee: IEmployee & { user: IUser };
	};
};

export type IQcRepairCreateModalProps = {
	bcewJob: IWeekScheduleResponse["bcewJobs"][number];
	date: Date;
	isTodayToBeStarted?: boolean;
	mode: FORM_MODE.CREATE;
};

export type IQcRepairUpdateModalProps = {
	mode: FORM_MODE.EDIT;
	dailyJobId: string;
};

export type IQcRepairModalProps = (IQcRepairCreateModalProps | IQcRepairUpdateModalProps) & {
	closeModal: () => void;
};

export type IQcInspectionCreateJobModalProps = {
	bcewJob: IWeekScheduleResponse["bcewJobs"][number];
	date: Date;
	closeModal: () => void;
	isTodayToBeStarted?: boolean;
	mode: FORM_MODE.CREATE;
};

export type IQcInspectionUpdateJobModalProps = {
	mode: FORM_MODE.EDIT;
	dailyJobId: string;
};

export type IQcInspectionJobModalProps = (IQcInspectionCreateJobModalProps | IQcInspectionUpdateJobModalProps) & {
	closeModal: () => void;
};

export type IQCRepairCardCreateFormProps = {
	mode: FORM_MODE.CREATE;
	isTodayToBeStarted: boolean;
};

export type IQCRepairCardUpdateFormProps = Required<Pick<DroppableCardProps, "dailyJobWithEmployee">> & {
	mode: FORM_MODE.EDIT;
};

export type IQCRepairCardFormProps = (IQCRepairCardCreateFormProps | IQCRepairCardUpdateFormProps) &
	Pick<DroppableCardProps, "bcewJob" | "rowType"> & {
		date: Date;
		setIsEditing: (isEditing: boolean) => void;
	};

export type IQCInspectionCardCreateFormProps = {
	mode: FORM_MODE.CREATE;
	isTodayToBeStarted: boolean;
};

export type IQCInspectionCardUpdateFormProps = Required<Pick<DroppableCardProps, "dailyJobWithEmployee">> & {
	mode: FORM_MODE.EDIT;
};

export type IQCInspectionCardFormProps = (IQCInspectionCardCreateFormProps | IQCInspectionCardUpdateFormProps) &
	Pick<DroppableCardProps, "bcewJob"> & {
		date: Date;
		setIsEditing: (isEditing: boolean) => void;
	};
