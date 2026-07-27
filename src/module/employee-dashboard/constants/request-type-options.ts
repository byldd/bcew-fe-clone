import { RequestTypeEnum } from "../enums/request-type";

export const REQUEST_TYPE_OPTIONS = [
	{
		label: "Vehicle Breakdown",
		value: RequestTypeEnum.VEHICLE_BREAKDOWN,
	},
	{
		label: "Vehicle Maintenance",
		value: RequestTypeEnum.VEHICLE_MAINTENANCE,
	},
	{
		label: "Add New Stop",
		value: RequestTypeEnum.ADD_NEW_STOP,
	},
];
