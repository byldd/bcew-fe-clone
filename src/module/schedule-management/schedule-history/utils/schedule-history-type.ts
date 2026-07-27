export interface IScheduleHistory {
	startDate: string;
	endDate: string;
	fileName?: string;
	fileUrl?: string;
	createdAt: string;
}

export interface IGetScheduleHistoryFilters {
	startDate: string;
	endDate: string;
}
