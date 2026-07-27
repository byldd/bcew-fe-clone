// -----------------
// react-query types
// -----------------
import { IPaginatedQuery } from "@/types";

export type IEmployeeNames = {
	id: string;
	EmployeeNumber: string;
	EmployeeName: string;
	Class: string;
	EmployeeStatus: number;
	isAlreadyInCrew: boolean;
};

export type IEmployeeNamesResponse = {
	items: IEmployeeNames[];
};

export type IDepartment = {
	idnum: string;
	dptnme: string;
	recnum: number;
};

export type IDepartmentResponse = {
	items: IDepartment[];
};

export type ICreateCrewPayload = {
	name: string;
	crewLeaderId: string;
	departmentId: string;
	crewEmployees: string[];
	jobPhaseNum: number;
};

export interface IPaginatedCrewSearchQuery extends IPaginatedQuery {
	jobPhaseNum?: number;
	department?: string;
	crewLeader?: string;
	startDate?: string;
	endDate?: string;
}

export type ICrewWithDetails = {
	id: string;
	name: string;
	jobPhaseNum: number;
	crewLeaderId: string;
	departmentId: string;
	updatedAt: string;
	createdAt: string;
	isWorkingOnWeekend: boolean;
	crewLeader: {
		id: string;
		bcewEmployeeNumber: number;
		employeeName: string;
	};
	crewEmployees: {
		id: string;
		crewId: string;
		employeeId: string;
		employee: {
			id: string;
			bcewEmployeeNumber: number;
			employeeName: string;
			user: {
				id: string;
				name: string;
			};
		};
	}[];
	department: {
		idnum: string;
		dptnme: string;
	};
};

export type ICrewsResponse = {
	items: ICrewWithDetails[];
	total: number;
	page: number;
	limit: number;
};

export enum EmployeeClass {
	Electrician = "Electrician",
}

export type ICrewLeaders = {
	employeeId: string;
	employeeName: string;
};

export type ICrewLeadersResponse = {
	item: ICrewLeaders[];
};
