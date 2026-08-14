export type ForemanMissingItemRequestsFiltersState = {
	projectNumbers: number[];
	jobNumbers: number[];
	jobNames: number[];
	phaseNames: string[];
	statuses: string[];
	requestedByUserIds: string[];
};

export type ForemanMissingItemRequestsParams = ForemanMissingItemRequestsFiltersState & {
	id: string | null;
	startDate: Date | null;
	endDate: Date | null;
	page: number;
	pageSize: number;
};

export type ForemanMissingItemRequestsParamsInput = Partial<{
	startDate: Date | null;
	endDate: Date | null;
	projectNumbers: number[] | null;
	jobNumbers: number[] | null;
	jobNames: number[] | null;
	phaseNames: string[] | null;
	statuses: string[] | null;
	requestedByUserIds: string[] | null;
	page: number | null;
	pageSize: number | null;
}>;
