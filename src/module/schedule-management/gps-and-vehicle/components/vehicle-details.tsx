"use client";
import React from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useVehicleColumns } from "../utils/GPSColumns";
import { useVehicleLogs } from "../hooks/useGPSLogs";
import { IVehicleDetailsProps } from "../types";
import { formatDateToMMDDYYYY } from "../../time-logs-management/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const VehicleDetails: React.FC<IVehicleDetailsProps> = ({
	searchQuery,
	currentPage,
	pageSize,
	setCurrentPage,
	setPageSize,
}) => {
	const {
		data: vehicleData,
		isPending,
		isError,
		error,
		isFetching,
	} = useVehicleLogs({
		page: currentPage,
		pageSize,
		searchValue: searchQuery,
	});

	const formattedVehicleData = vehicleData?.items.map((vehicle) => ({
		...vehicle,
		lastAssignedTime: vehicle.lastAssignedTime ? formatDateToMMDDYYYY(String(vehicle.lastAssignedTime)) : "--",
	}));
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const vehicleColumns = useVehicleColumns();

	if (isError) return <div className="p-4 text-lg text-red-500">{error?.message || tschedule.somethingWentWrong}</div>;

	return (
		<DataTable
			useSectionHeader={false}
			className="vehicle-details-table !p-0"
			title=""
			columns={vehicleColumns}
			data={formattedVehicleData ?? []}
			searchValue={searchQuery}
			searchPlaceholder={tTimeLogs.searchByRegNoOrAssignedTo}
			isLoading={isPending || isFetching}
			paginatorOptions={{
				currentPage,
				pageSize,
				total: vehicleData?.total || 10,
				setPage: setCurrentPage,
				setPageSize: (size: number) => {
					setPageSize(size);
					setCurrentPage(1);
				},
			}}
		/>
	);
};

export default VehicleDetails;
