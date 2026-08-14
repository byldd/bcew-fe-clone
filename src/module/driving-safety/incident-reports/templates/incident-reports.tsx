"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiSearch } from "react-icons/fi";

import { AxiosError } from "axios";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/shared/datatable/datatable";
import SectionHeader from "@/components/shared/section-header";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import ConfirmModal from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
import { dateToUTCString } from "@/lib/utils/date";
import { useModal } from "@/hooks/useModal";
import useAuthStore from "@/store/auth-store";
import { ADD_RECORD_TAB, ADD_RECORD_TAB_PARAM } from "@/module/admin-driving-safety/enums";

import VehicleBreakdownReviewModal from "../components/vehicle-breakdown-review-modal";
import ViolationReviewModal from "../components/violation-review-modal";
import { useAccidentStatusAction } from "../hooks/useAccidentReport";
import { useIncidentReports, useUpdateIncidentSeverity } from "../hooks/useIncidentReports";
import { useIncidentReportsParams } from "../hooks/useIncidentReportsParams";
import { IIncidentReportRow } from "../types";
import {
	ACCIDENT_STATUS_ACTION,
	INCIDENT_REPORT_STATUS,
	INCIDENT_SEVERITY,
	INCIDENT_TYPE,
	INCIDENT_TYPE_TAB,
} from "../utils/enums";
import { getIncidentReportColumns } from "../utils/incident-reports-columns";
import { ACCIDENT_STATUS_ACTION_SUCCESS } from "../utils/status-actions";
import {
	APPROVE_AND_SEND_TO_INSURANCE_CONFIRM,
	APPROVE_INTERNALLY_CONFIRM,
	CLOSED_STATUSES,
	IConfirmActionCopy,
	MARK_AS_RESOLVED_CONFIRM,
	MARK_FOR_PRESIDENT_REVIEW_CONFIRM,
	matchesStatusFilter,
	matchesTab,
	SEVERITY_FILTER_OPTIONS,
	STATUS_FILTER_OPTIONS,
	TAB_TRIGGER_CLASS,
	TYPE_FILTER_OPTIONS,
} from "../utils/constants";

const MultiFilterSelect = <T extends string>({
	label,
	selected,
	options,
	onChange,
}: {
	label: string;
	selected: T[];
	options: { value: T; label: string }[];
	onChange: (values: T[]) => void;
}) => {
	const toggle = (value: T) =>
		onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

	const singleLabel = options.find((option) => option.value === selected[0])?.label ?? "1";
	const [firstWord, ...restWords] = singleLabel.split(" ");
	const summary =
		selected.length === 0
			? "All"
			: selected.length === 1
				? restWords.length
					? `${firstWord}...`
					: singleLabel
				: `${selected.length} selected`;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-10 w-auto min-w-[130px] items-center justify-between gap-2 rounded-[10px] border border-brand-dark10 bg-white px-3 text-sm text-brand-dark"
				>
					<span className="truncate">
						{label}: {summary}
					</span>
					<FiChevronDown size={16} className="shrink-0 text-brand-dark50" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-[200px] p-1">
				{options.map((option) => (
					<label
						key={option.value}
						className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 text-sm hover:bg-brand-bgLightgrey"
					>
						<Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
						{option.label}
					</label>
				))}
			</PopoverContent>
		</Popover>
	);
};

const matchesSearch = (report: IIncidentReportRow, search: string) => {
	if (!search) return true;
	const haystack = [report.recordNumber, report.employeeName, report.truckNumber, report.detail]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	return haystack.includes(search.toLowerCase());
};

const IncidentReports = ({
	range,
	title = "Incident Reports",
	titleClassName,
	showTabs = true,
	hideSidebarToggle = false,
}: {
	range?: { startDate?: string; endDate?: string };
	title?: string;
	titleClassName?: string;
	showTabs?: boolean;
	hideSidebarToggle?: boolean;
} = {}) => {
	const router = useRouter();
	const { getParams, setParams } = useIncidentReportsParams();
	const { tab, search, startDate, endDate, showResolvedClosed, typeFilter, severityFilter, statusFilter } = getParams();

	const selfManaged = range === undefined;
	// Toggle off: only open/active reports (hide resolved & rejected).
	// Toggle on: only resolved & rejected. When a range is supplied the list isn't self-managed, so show everything.
	const matchesResolvedFilter = (report: IIncidentReportRow) =>
		!selfManaged ||
		(showResolvedClosed ? CLOSED_STATUSES.includes(report.status) : !CLOSED_STATUSES.includes(report.status));
	const effectiveRange = selfManaged
		? {
				startDate: startDate ? dateToUTCString(startDate) : undefined,
				endDate: endDate ? dateToUTCString(endDate) : undefined,
			}
		: range;

	const { user } = useAuthStore((state) => state);
	const { data, isLoading } = useIncidentReports(effectiveRange);
	const updateSeverity = useUpdateIncidentSeverity();
	const statusAction = useAccidentStatusAction();

	const goToCreateViolation = () =>
		router.push(
			`${routes.admin.drivingSafetyAddNewRecord}?${ADD_RECORD_TAB_PARAM}=${ADD_RECORD_TAB.DRIVING_SAFETY_VIOLATION}`
		);

	const { Modal, openModal, closeModal } = useModal();

	const onSeverityChange = useCallback(
		(report: IIncidentReportRow, severity: INCIDENT_SEVERITY) => {
			updateSeverity.mutate(
				{ id: report.id, type: report.type, severity },
				{ onError: (error) => openErrorToast({ error: error as AxiosError<{ message: string }> }) }
			);
		},
		[updateSeverity]
	);

	// Breakdowns/violations review in a modal; accidents have a full review page of their own.
	const openReview = useCallback(
		(report: IIncidentReportRow) => {
			if (report.type === INCIDENT_TYPE.VEHICLE_ACCIDENT) {
				// Admin-created drafts reopen the create form to continue editing.
				if (report.status === INCIDENT_REPORT_STATUS.DRAFT) {
					router.push(`${routes.admin.drivingSafetyAddNewRecord}?draftId=${report.id}`);
					return;
				}
				router.push(routes.admin.drivingSafetyAccidentReview(report.id));
				return;
			}

			if (report.type === INCIDENT_TYPE.DRIVING_SAFETY_VIOLATION) {
				openModal({
					modalTitle: "Safety Violation Report",
					modalView: <ViolationReviewModal violationId={report.id} />,
					variant: "default",
				});
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

	const runStatusAction = useCallback(
		async (report: IIncidentReportRow, action: ACCIDENT_STATUS_ACTION) => {
			try {
				await statusAction.mutateAsync({ id: report.id, action });
				openSuccessToast(ACCIDENT_STATUS_ACTION_SUCCESS[action]);
			} catch (error) {
				openErrorToast({ error: error as AxiosError<{ message: string }> });
			}
		},
		[statusAction]
	);

	const onStatusAction = useCallback(
		(report: IIncidentReportRow, action: ACCIDENT_STATUS_ACTION) => {
			const confirmCopy: IConfirmActionCopy = {
				[ACCIDENT_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW]: MARK_FOR_PRESIDENT_REVIEW_CONFIRM,
				[ACCIDENT_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE]: APPROVE_AND_SEND_TO_INSURANCE_CONFIRM,
				[ACCIDENT_STATUS_ACTION.RESOLVE_INTERNALLY]: APPROVE_INTERNALLY_CONFIRM,
				[ACCIDENT_STATUS_ACTION.MARK_RESOLVED]: MARK_AS_RESOLVED_CONFIRM,
			}[action];

			openModal({
				modalTitle: confirmCopy.title,
				modalView: (
					<ConfirmModal
						description={confirmCopy.description}
						confirmText={confirmCopy.confirmText}
						onConfirm={() => {
							closeModal();
							runStatusAction(report, action);
						}}
						onCancel={closeModal}
					/>
				),
			});
		},
		[openModal, closeModal, runStatusAction]
	);

	const columns = useMemo(
		() => getIncidentReportColumns(openReview, onSeverityChange, { roleName: user?.role?.name, onStatusAction }),
		[openReview, onSeverityChange, user?.role?.name, onStatusAction]
	);

	const rows = useMemo(() => {
		return (data ?? []).filter(
			(report) =>
				matchesTab(report, tab) &&
				matchesResolvedFilter(report) &&
				(!typeFilter.length || typeFilter.includes(report.type)) &&
				(!severityFilter.length || (report.severity !== null && severityFilter.includes(report.severity))) &&
				matchesStatusFilter(report, statusFilter) &&
				matchesSearch(report, search)
		);
	}, [data, tab, search, showResolvedClosed, selfManaged, typeFilter, severityFilter, statusFilter]);

	const countForTab = (candidate: INCIDENT_TYPE_TAB) =>
		(data ?? []).filter((report) => matchesTab(report, candidate) && matchesResolvedFilter(report)).length;

	const searchInput = (
		<div className="relative w-full sm:w-[360px]">
			<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
			<input
				type="text"
				placeholder="Search by Employee, Truck Number"
				className="h-10 w-full rounded-[10px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm"
				value={search}
				onChange={(event) => setParams({ search: event.target.value })}
			/>
		</div>
	);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<SectionHeader title={title} titleClassName={titleClassName} hideSidebarToggle={hideSidebarToggle} />

				<div className="flex flex-wrap items-center gap-2">
					{selfManaged ? (
						<>
							<DatePicker
								mode="range"
								placeholder="Select date"
								alwaysShowLabel
								selected={{ from: startDate ?? undefined, to: endDate ?? undefined }}
								onSelect={(value) => {
									if (!value?.from) {
										setParams({ startDate: null, endDate: null });
										return;
									}
									setParams({ startDate: value.from, endDate: value.to ?? null });
								}}
								onClear={() => setParams({ startDate: null, endDate: null })}
								required={false}
								className="!h-10 w-[180px] border border-brand-dark10 !bg-white text-sm shadow-none"
							/>
							<Button type="button" variant="filled" onClick={goToCreateViolation}>
								Create Driving Safety Violation
							</Button>
						</>
					) : (
						searchInput
					)}
				</div>
			</div>

			{showTabs && (
				<Tabs value={tab} onValueChange={(value) => setParams({ tab: value as INCIDENT_TYPE_TAB })}>
					<div className="no-scrollbar overflow-x-auto py-1">
						<TabsList className="inline-flex h-10 min-w-max items-center justify-start gap-2 rounded-[8px] bg-transparent p-0">
							<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.ALL}>
								All ({countForTab(INCIDENT_TYPE_TAB.ALL)})
							</TabsTrigger>
							<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.ACCIDENTS}>
								Accidents
							</TabsTrigger>
							<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.VIOLATIONS}>
								Violations
							</TabsTrigger>
							<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.BREAKDOWN}>
								Breakdown
							</TabsTrigger>
							<TabsTrigger className={TAB_TRIGGER_CLASS} value={INCIDENT_TYPE_TAB.DRAFTS}>
								Drafts
							</TabsTrigger>
						</TabsList>
					</div>
				</Tabs>
			)}

			{selfManaged && (
				<div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
					{searchInput}
					<div className="flex flex-wrap items-center gap-2">
						<MultiFilterSelect
							label="Types"
							selected={typeFilter}
							options={TYPE_FILTER_OPTIONS}
							onChange={(values) => setParams({ typeFilter: values })}
						/>
						<MultiFilterSelect
							label="Severity"
							selected={severityFilter}
							options={SEVERITY_FILTER_OPTIONS}
							onChange={(values) => setParams({ severityFilter: values })}
						/>
						<MultiFilterSelect
							label="Statuses"
							selected={statusFilter}
							options={STATUS_FILTER_OPTIONS}
							onChange={(values) => setParams({ statusFilter: values })}
						/>
						<label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-brand-dark">
							Show resolved &amp; closed
							<Switch
								checked={showResolvedClosed}
								onCheckedChange={(checked) => setParams({ showResolvedClosed: checked })}
							/>
						</label>
					</div>
				</div>
			)}

			<DataTable
				columns={columns}
				data={rows}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				compact
				enableSorting
				useSectionHeader={false}
			/>

			<Modal />
		</div>
	);
};

export default IncidentReports;
