"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

import { useModal } from "@/hooks/useModal";
import ImageModal from "@/components/shared/image-upload/image-modal";

import { JobLevelCommsJob, JobLevelDetailsProps } from "../utils/types";
import { JOB_HIERARCHY_LIMIT, WORK_ORDER_TAB_KEY } from "../constants";
import { BUILDER_COMMS_PHASE_TYPE } from "@/module/builder-communication/types";
import JobLevelDetailsSidebar from "./job-level-sidebar";
import { InfoField } from "./job-level-details-shared";
import { JobLevelJobNotes } from "./job-level-job-notes";
import JobLevelDetailsPhaseDetails from "./job-level-phase-details";
import JobLevelDetailsWorkOrders from "./job-level-work-orders";
import JobLevelTodoPlaceholder from "./job-level-todo-placeholder";
import JobLevelMaterialStatusPlaceholder from "./job-level-material-status-placeholder";
import JobLevelCollapsibleSection from "./job-level-collapsible-section";
import JobLevelScheduleMilestones from "./job-level-schedule-milestones";
import JobLevelImportantDocuments from "./job-level-important-documents";
import JobLevelScheduleHistoryModal from "./job-level-schedule-history-modal";
import {
	buildSchedulePhaseRows,
	getCurrentPhase,
	getForemanAssigned,
	getJobNotes,
	getJobStatus,
	getPhaseStatus,
	getPhaseStatusClass,
} from "../utils";
import { FALLBACK } from "../constants";
import { JobScheduleMilestoneKey } from "../utils/types";
import { useJobScheduleHistory } from "../hooks/useJobScheduleHistory";

export default function JobLevelDetails({
	projects,
	selectedItem,
	setSelectedItem,
	searchQuery,
}: JobLevelDetailsProps) {
	const [openCategories, setOpenCategories] = useState<string[]>([]);
	const [visibleJobsByCategory, setVisibleJobsByCategory] = useState<Record<string, number>>({});
	const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

	const { openModal, closeModal, Modal } = useModal();

	const getVisibleJobs = (category: string) => visibleJobsByCategory[category] ?? JOB_HIERARCHY_LIMIT;

	const loadMoreJobs = (category: string) => {
		setVisibleJobsByCategory((prev) => ({
			...prev,
			[category]: (prev[category] ?? JOB_HIERARCHY_LIMIT) + JOB_HIERARCHY_LIMIT,
		}));
	};

	const categoryGroups = useMemo(() => {
		const categoryMap = new Map<string, Map<number, JobLevelCommsJob>>();

		projects.forEach((project) => {
			if (!categoryMap.has(project.projectName)) {
				categoryMap.set(project.projectName, new Map<number, JobLevelCommsJob>());
			}

			const jobMap = categoryMap.get(project.projectName)!;
			project.jobs.forEach((job) => {
				if (!jobMap.has(job.jobId)) {
					jobMap.set(job.jobId, job);
				}
			});
		});

		return Array.from(categoryMap.entries())
			.map(([projectName, jobsMap]) => ({
				projectName,
				jobs: Array.from(jobsMap.values()).sort((a, b) => a.jobName.localeCompare(b.jobName)),
			}))
			.sort((a, b) => a.projectName.localeCompare(b.projectName));
	}, [projects]);

	useEffect(() => {
		setVisibleJobsByCategory({});
	}, [projects]);

	useEffect(() => {
		if (searchQuery) {
			setOpenCategories(categoryGroups.map((group) => group.projectName));
			setVisibleJobsByCategory(
				categoryGroups.reduce<Record<string, number>>((acc, group) => {
					acc[group.projectName] = Math.max(JOB_HIERARCHY_LIMIT, group.jobs.length);
					return acc;
				}, {})
			);
			return;
		}

		setOpenCategories([]);
	}, [categoryGroups, searchQuery]);

	useEffect(() => {
		if (!selectedItem) {
			setSelectedPhaseId(null);
			return;
		}

		if (selectedItem.phases.length > 0) {
			setSelectedPhaseId(selectedItem.phases[0]?.id ?? null);
			return;
		}

		if (selectedItem.workOrders.length > 0) {
			setSelectedPhaseId(WORK_ORDER_TAB_KEY);
			return;
		}

		setSelectedPhaseId(null);
	}, [selectedItem]);

	const jobStatus = getJobStatus(selectedItem);
	const { data: scheduleHistory } = useJobScheduleHistory(selectedItem?.jobId);
	const schedulePhaseRows = useMemo(
		() => buildSchedulePhaseRows(scheduleHistory?.entries ?? null),
		[scheduleHistory?.entries]
	);

	const openImagePreview = (url: string) => {
		openModal({
			modalTitle: "Preview",
			modalView: <ImageModal imageUrl={url} onClose={closeModal} />,
			variant: "big",
		});
	};

	const foremanAssigned = getForemanAssigned(selectedItem);
	const jobNotes = useMemo(() => getJobNotes(selectedItem), [selectedItem]);
	const selectedPhase =
		selectedPhaseId === WORK_ORDER_TAB_KEY
			? null
			: (selectedItem?.phases.find((phase) => phase.id === selectedPhaseId) ?? null);
	const isWorkOrderSelected = selectedPhaseId === WORK_ORDER_TAB_KEY;

	const openScheduleHistory = (highlightedMilestoneKey?: JobScheduleMilestoneKey) => {
		if (!selectedItem) return;

		openModal({
			modalTitle: `${selectedItem.jobName} (${selectedItem.jobId})`,
			subHeader: "Schedule Edit History",
			modalView: (
				<JobLevelScheduleHistoryModal jobId={selectedItem.jobId} highlightedMilestoneKey={highlightedMilestoneKey} />
			),
			variant: "big",
		});
	};

	return (
		<div className="grid grid-cols-1 gap-4 lg:h-[700px] lg:grid-cols-[280px_1fr]">
			<Modal />

			<JobLevelDetailsSidebar
				categoryGroups={categoryGroups}
				openCategories={openCategories}
				onOpenCategoriesChange={setOpenCategories}
				selectedItem={selectedItem}
				onSelectJob={setSelectedItem}
				getVisibleJobs={getVisibleJobs}
				onLoadMoreJobs={loadMoreJobs}
			/>

			<div className="space-y-4 rounded-[10px] border-none bg-white p-4 shadow-md lg:overflow-y-auto">
				{selectedItem ? (
					<>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="space-y-1">
								<h2 className="text-base font-semibold text-brand-dark">
									{selectedItem.jobName} ({selectedItem.jobId})
								</h2>
								<p className="text-xs text-brand-dark50">Activity &amp; Phase Timeline</p>
							</div>
							<Badge
								className={`${getPhaseStatusClass(jobStatus)} !h-auto !rounded-full !border-0 !px-3 !py-1 text-[11px] uppercase`}
							>
								{jobStatus}
							</Badge>
						</div>

						<div className="rounded-[12px] border border-brand-dark10 bg-white p-4 shadow-sm">
							<h3 className="text-sm font-semibold text-brand-dark">Job Overview</h3>
							<div className="no-scrollbar mt-3 flex items-start gap-x-8 gap-y-4 overflow-x-auto">
								<InfoField
									label="Department"
									className="shrink-0"
									value={selectedItem.schedule?.department ? String(selectedItem.schedule.department) : FALLBACK}
								/>
								<InfoField label="Model Name" className="shrink-0" value={selectedItem.schedule?.model || FALLBACK} />
								<InfoField
									label="Building Job #"
									className="shrink-0"
									value={selectedItem.schedule?.buildingJobNumber || FALLBACK}
								/>
								<InfoField label="Foreman Assigned" className="shrink-0" value={foremanAssigned} />
								<InfoField label="Current Phase" className="shrink-0" value={getCurrentPhase(selectedItem)} />
								<div className="flex min-w-[160px] max-w-[260px] flex-col items-start space-y-2">
									<p className="text-xs font-normal tracking-wide text-brand-dark50">Job Note</p>
									<JobLevelJobNotes notes={jobNotes} />
								</div>
							</div>
						</div>

						<JobLevelScheduleMilestones
							rows={schedulePhaseRows}
							onOpenHistory={() => openScheduleHistory()}
							onOpenPhaseHistory={(key) => openScheduleHistory(key)}
						/>

						<JobLevelImportantDocuments />

						<div className="no-scrollbar overflow-x-auto py-0.5">
							<div className="flex min-w-max items-center gap-2">
								{selectedItem.phases.map((phase) => {
									const status = getPhaseStatus(phase);
									const isSelected = selectedPhaseId === phase.id;
									return (
										<button
											type="button"
											onClick={() => setSelectedPhaseId(phase.id)}
											key={phase.id}
											className={`h-9 whitespace-nowrap rounded-[8px] px-3 py-1 text-xs font-medium transition-colors ${
												isSelected
													? "bg-black text-white"
													: status === "Completed"
														? "bg-green-100 text-green-700"
														: "bg-gray-100 text-brand-dark80"
											}`}
										>
											{phase.tsknme}
										</button>
									);
								})}
								{selectedItem.workOrders.length > 0 && (
									<button
										type="button"
										onClick={() => setSelectedPhaseId(WORK_ORDER_TAB_KEY)}
										className={`h-9 whitespace-nowrap rounded-[8px] px-3 py-1 text-xs font-medium transition-colors ${
											isWorkOrderSelected ? "bg-black text-white" : "bg-gray-100 text-brand-dark80"
										}`}
									>
										{BUILDER_COMMS_PHASE_TYPE.WORK_ORDER}
									</button>
								)}
							</div>
						</div>

						{(selectedPhase || (isWorkOrderSelected && selectedItem.workOrders.length > 0)) && (
							<JobLevelCollapsibleSection
								title="Phase Overview"
								headerActions={
									selectedPhase ? (
										<span
											className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${getPhaseStatusClass(
												getPhaseStatus(selectedPhase)
											)}`}
										>
											{getPhaseStatus(selectedPhase)}
										</span>
									) : null
								}
							>
								{selectedPhase && (
									<JobLevelDetailsPhaseDetails phase={selectedPhase} onOpenImagePreview={openImagePreview} />
								)}

								{isWorkOrderSelected && selectedItem.workOrders.length > 0 && (
									<JobLevelDetailsWorkOrders
										workOrders={selectedItem.workOrders}
										onOpenImagePreview={openImagePreview}
									/>
								)}
							</JobLevelCollapsibleSection>
						)}

						<JobLevelTodoPlaceholder />
						<JobLevelMaterialStatusPlaceholder
							jobId={selectedItem?.jobId}
							phaseTsknum={selectedPhase?.tsknum}
							jobDailyRecordId={selectedPhase?.jobDailyRecords?.[0]?.id}
							onOpenImagePreview={openImagePreview}
						/>
					</>
				) : (
					<div className="flex h-full min-h-[300px] items-center justify-center text-center text-sm text-brand-dark50">
						Select a job from the left panel to view Job Level Details.
					</div>
				)}
			</div>
		</div>
	);
}
