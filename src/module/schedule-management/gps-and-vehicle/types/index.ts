export interface IJobDetailsProps {
	searchQuery: string;
	currentPage: number;
	pageSize: number;
	setCurrentPage: (page: number) => void;
	setPageSize: (size: number) => void;
}

export interface IVehicleDetailsProps {
	searchQuery: string;
	currentPage: number;
	pageSize: number;
	setCurrentPage: (page: number) => void;
	setPageSize: (size: number) => void;
}
