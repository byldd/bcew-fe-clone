"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

import { DataTable } from "@/components/shared/datatable/datatable";
import SectionHeader from "@/components/shared/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
import { useModal } from "@/hooks/useModal";

import VehicleBreakdownReviewModal from "../components/vehicle-breakdown-review-modal";
import { useIncidentReports } from "../hooks/useIncidentReports";
import { useIncidentReportsParams } from "../hooks/useIncidentReportsParams";
import { IIncidentReportRow } from "../types";
import { INCIDENT_TYPE, INCIDENT_TYPE_TAB } from "../utils/enums";
import { getIncidentReportColumns } from "../utils/incident-reports-columns";

const TAB_TRIGGER_CLASS =
	"inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark";

const TAB_TYPE: Record<INCIDENT_TYPE_TAB, INCIDENT_TYPE | null> = {
	[INCIDENT_TYPE_TAB.ALL]: null,
	[INCIDENT_TYPE_TAB.ACCIDENTS]: INCIDENT_TYPE.VEHICLE_ACCIDENT,
	[INCIDENT_TYPE_TAB.BREAKDOWN]: INCIDENT_TYPE.VEHICLE_BREAKDOWN,
};

const matchesSearch = (report: IIncidentReportRow, search: string) => {
	if (!search) return true;
	const haystack = [report.recordNumber, report.employeeName, report.truckNumber, report.detail]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	return haystack.includes(search.toLowerCase());
};

const IncidentReports = () => {
	const router = useRouter();
	const { getParams, setParams } = useIncidentReportsParams();
	const { tab, search } = getParams();

	const { data, isLoading } = useIncidentReports();

	const { Modal, openModal, closeModal } = useModal();

	// Breakdowns review in a modal; accidents have a full review page of their own.
	const openReview = useCallback(
		(report: IIncidentReportRow) => {
			if (report.type === INCIDENT_TYPE.VEHICLE_ACCIDENT) {
				router.push(routes.admin.drivingSafetyAccidentReview(report.id));
				return;
			}

			openModal({
				modalTitle: "Vehicle Breakdown Report",
				modalView: <VehicleBreakdownReviewModal breakdownId={report.id} onClose={closeModal} />,
				variant: "default",
			});
		},
		[openModal, closeModal, router]
	);

	const columns = useMemo(() => getIncidentReportColumns(openReview), [openReview]);

	const rows = useMemo(() => {
		const reports = data ?? [];
		const typeForTab = TAB_TYPE[tab];
		return reports.filter(
			(report) => (typeForTab === null || report.type === typeForTab) && matchesSearch(report, search)
		);
	}, [data, tab, search]);

	const countForTab = (candidate: INCIDENT_TYPE_TAB) => {
		const typeForTab = TAB_TYPE[candidate];
		return (data ?? []).filter((report) => typeForTab === null || report.type === typeForTab).length;
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title="Incident Reports" />

				<div className="relative">
					<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
					<input
						type="text"
						placeholder="Search by driver, vehicle, truck #..."
						className="h-10 w-[280px] rounded-[10px] border-none bg-white pl-9 pr-3 text-sm outline-none"
						value={search}
						onChange={(event) => setParams({ search: event.target.value })}
					/>
				</div>
			</div>

			<Tabs value={tab} onValueChange={(value) => setParams({ tab: value as INCIDENT_TYPE_TAB })}>
				<TabsList className="inline-flex h-10 items-center justify-start gap-2 rounded-md bg-transparent p-0">
					<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.ALL}>
						All ({countForTab(INCIDENT_TYPE_TAB.ALL)})
					</TabsTrigger>
					<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.ACCIDENTS}>
						Accidents
					</TabsTrigger>
					<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.BREAKDOWN}>
						Breakdown
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<DataTable
				columns={columns}
				data={rows}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				useSectionHeader={false}
			/>

			<Modal />
		</div>
	);
};

export default IncidentReports;
