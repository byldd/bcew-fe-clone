"use client";
import React from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useJobColumns } from "../utils/GPSColumns";
import { useGPSLogs } from "../hooks/useGPSLogs";
import { IJobDetailsProps } from "../types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const JobDetails: React.FC<IJobDetailsProps> = ({
	searchQuery,
	currentPage,
	pageSize,
	setCurrentPage,
	setPageSize,
}) => {
	const {
		data: gpsData,
		isPending,
		isError,
		error,
	} = useGPSLogs({
		page: currentPage,
		pageSize,
		searchValue: searchQuery,
	});
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const jobColumns = useJobColumns();

	if (isError) return <div className="p-4 text-lg text-red-500">{error?.message || tschedule.somethingWentWrong}</div>;

	return (
		<DataTable
			useSectionHeader={false}
			className="job-details-table !p-0"
			title=""
			columns={jobColumns}
			data={gpsData?.items ?? []}
			searchValue={searchQuery}
			searchPlaceholder={tTimeLogs.searchByJobNameOrAddress}
			isLoading={isPending}
			paginatorOptions={{
				currentPage,
				pageSize,
				total: gpsData?.total || 10,
				setPage: setCurrentPage,
				setPageSize: (size: number) => {
					setPageSize(size);
					setCurrentPage(1);
				},
			}}
		/>
	);
};

export default JobDetails;
