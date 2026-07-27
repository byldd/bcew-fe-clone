import { IPaginatedQuery } from "@/types";

export type ISubContractor = {
	id: string;
	userId: string;
	name: string;
};

export type ISubContractorResponse = {
	items: ISubContractor[];
};

export type ISubContractorCrewEmployee = {
	id: string;
	name: string;
	subContractorCrewId: string;
};

export type ISubContractorCrew = {
	id: string;
	name: string;
	isAccessPaused: boolean;
	crewLeaderName: string;
	email: string;
	phoneNumber: string;
	subcontractorId: string;
	updatedAt: string;
	createdAt: string;
	deletedAt: string | null;
	crewEmployees: ISubContractorCrewEmployee[];
};

export type ISubContractorCrewResponse = {
	items: ISubContractorCrew[];
	total: number;
	page: number;
	pageSize: number;
};

export enum SUB_CONTRACTOR_CREW_STATUS {
	ACTIVE = "active",
	INACTIVE = "inactive",
}

export interface ISubContractorCrewQuery extends IPaginatedQuery {
	crewStatus?: SUB_CONTRACTOR_CREW_STATUS;
}
