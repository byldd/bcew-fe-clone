export type IGeoTabDevice = {
	id: bigint;
	GeotabId: string;
	ActiveFrom?: string;
	ActiveTo?: string;
	Comment?: string;
	DeviceType: string;
	LicensePlate?: string;
	LicenseState?: string;
	Name?: string;
	ProductId?: number;
	SerialNumber?: string;
	VIN?: string;
	EntityStatus: number;
	RecordLastChangedUtc: string;
};

export type IZoneStopEventsWithDriver = {
	ActiveFrom: Date | null;
	ActiveTo: Date | null;
	ZoneName: string | null;
	TruckNumber: string;
	DriverName: string | null;
	DriverChangeTime: Date | null;
	DeviceFullName: string | null;
	DeviceGeotabId: string | null;
	DriverGeotabId: string | null;
};
