export interface IStorageUnit {
	id: string | null;
	ActiveFrom: string | null;
	ZoneName: string | null;
	projectName: string | null;
	isMaterialPickup: boolean;
	isScheduled: boolean;
}

export interface IEmployeeStorageUnits {
	EmployeeNo: string;
	FirstName: string;

	storageUnits: IStorageUnit[];
}
