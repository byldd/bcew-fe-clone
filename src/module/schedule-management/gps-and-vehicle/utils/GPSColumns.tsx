import { ColumnDef } from "@tanstack/react-table";
import { IGPS, IVehicle } from "../../time-logs-management/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const useJobColumns = () => {
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const Columns: ColumnDef<IGPS>[] = [
		{
			accessorKey: "Name",
			header: tTimeLogs.jobName,
		},
		{
			accessorKey: "address",
			header: tTimeLogs.address,
		},
		{
			accessorKey: "CentroidLatitude",
			header: tTimeLogs.latitude,
		},
		{
			accessorKey: "CentroidLongitude",
			header: tTimeLogs.longitude,
		},
	];
	return Columns;
};

export const useVehicleColumns = () => {
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const Columns: ColumnDef<IVehicle>[] = [
		{
			accessorKey: "Truck_Number",
			header: tTimeLogs.vehicleRegNo,
		},
		{
			accessorKey: "DeviceId",
			header: tTimeLogs.gpsTrackerId,
		},
		{
			accessorKey: "EmployeeNumber",
			header: tTimeLogs.assignedTo,
			cell: ({ row }) => <div>{row.original.user?.EmployeeName || row.original.Driver}</div>,
		},
		{
			accessorKey: "CellNumber",
			header: tTimeLogs.contactDetails,
			cell: ({ row }) => (
				<div>
					{row.original.user?.CellNumber}
					<br />
					<a href={`mailto:${row.original.user?.e_mail}`} className="text-xs text-blue-600">
						{row.original.user?.e_mail}
					</a>
				</div>
			),
		},
		{
			accessorKey: "lastAssignedTime",
			header: tTimeLogs.dateOfIssue,
		},
		{
			accessorKey: "Odometer_Reading",
			header: tTimeLogs.totalDistanceTraveled,
		},
		{
			accessorKey: "Truck_Status",
			header: tTimeLogs.reasonForChange,
		},
	];
	return Columns;
};
