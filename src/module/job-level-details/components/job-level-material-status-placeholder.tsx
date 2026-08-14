"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiPackage } from "react-icons/fi";
import { ChevronUp, ChevronDown } from "lucide-react";
import JobLevelPullListTemplate from "../templates/job-level-pull-list-template";
import JobLevelAdditionalMaterialList from "./job-level-additional-material-list";
import MaterialStatusPhotos from "./material-status-photos";
import { useJobMaterialStatus } from "../hooks/useJobMaterialStatus";
import { useJobCrateActivity } from "../hooks/useJobCrateActivity";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { STATUS_DONE, DELIVERY_STATUS_ROW_TITLE } from "../utils/constants";
import { buildRows, buildCrateActivityRows } from "../utils";

export default function JobLevelMaterialStatusPlaceholder({
	jobId,
	phaseTsknum,
	jobDailyRecordId,
	onOpenImagePreview,
}: {
	jobId?: number | null;
	phaseTsknum?: number | null;
	jobDailyRecordId?: string | null;
	onOpenImagePreview: (url: string) => void;
}) {
	const router = useRouter();
	const canOpenPullList = Boolean(jobId && phaseTsknum);
	const canRequestMaterial = Boolean(jobDailyRecordId);

	const handleRequestAdditionalMaterial = () => {
		if (!jobDailyRecordId) return;
		router.push(
			routes.admin.jobMaterialSelection({
				jobDailyRecordId,
				jobnum: jobId ?? undefined,
				tsknum: phaseTsknum ?? undefined,
			})
		);
	};
	const [isPullListOpen, setIsPullListOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const [collapsedRows, setCollapsedRows] = useState<Record<string, boolean>>({});
	const [isCrateActivityCollapsed, setIsCrateActivityCollapsed] = useState(false);

	const { data, isLoading } = useJobMaterialStatus(jobId, phaseTsknum);
	const { data: crateActivityData, isLoading: isCrateActivityLoading } = useJobCrateActivity(jobId, phaseTsknum);

	const hasCrateReceived = useMemo(
		() => (crateActivityData ?? []).some((item) => item.scan_action === CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE),
		[crateActivityData]
	);
	const rows = useMemo(() => (data ? buildRows(data, hasCrateReceived) : []), [data, hasCrateReceived]);
	const crateActivityRows = useMemo(
		() => (crateActivityData ? buildCrateActivityRows(crateActivityData) : []),
		[crateActivityData]
	);

	const completedCount = useMemo(() => rows.filter((r) => r.statusClassName === STATUS_DONE).length, [rows]);

	const showBody = !isCollapsed || isPullListOpen;
	const visibleRows = isCollapsed ? rows.slice(0, 1) : rows;
	const showAdditionalMaterial = !isCollapsed && canOpenPullList;

	useEffect(() => {
		setIsPullListOpen(false);
		setIsCollapsed(true);
		setCollapsedRows({});
		setIsCrateActivityCollapsed(false);
	}, [jobId, phaseTsknum]);

	const handleTogglePullList = () => {
		if (!canOpenPullList) return;
		setIsPullListOpen((prev) => !prev);
	};

	const toggleRow = (title: string) => {
		setCollapsedRows((prev) => ({ ...prev, [title]: !prev[title] }));
	};

	return (
		<div className="space-y-2 rounded-[14px] border-none bg-white px-4 py-6 shadow-md">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<p className="text-sm font-semibold uppercase tracking-wide text-brand-greyLight">Material Status</p>
					{completedCount > 0 && (
						<span className="text-xs font-medium text-brand-greyLight">
							({completedCount} Completed step{completedCount > 1 ? "s" : ""} {isCollapsed ? "hidden" : "completed"})
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={handleTogglePullList}
						disabled={!canOpenPullList}
						title={!canOpenPullList ? "Select a phase to view the pull list." : "Toggle Pull List"}
						className="flex h-8 items-center gap-2 rounded-[10px] bg-black px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isPullListOpen ? "Close Pull List" : "Open Pull List"}
					</Button>
					<Button
						variant="ghost"
						onClick={() => setIsCollapsed((prev) => !prev)}
						className="flex items-center gap-1 rounded-[10px] px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-gray-50"
					>
						{isCollapsed ? (
							<>
								Expand All <ChevronDown className="h-3.5 w-3.5" />
							</>
						) : (
							<>
								Collapse All <ChevronUp className="h-3.5 w-3.5" />
							</>
						)}
					</Button>
				</div>
			</div>

			{showBody && (
				<>
					{!canOpenPullList ? (
						<p className="py-6 text-center text-sm text-brand-dark50">Select a phase to view its material status.</p>
					) : isLoading ? (
						<p className="py-4 text-center text-sm text-brand-dark50">Loading material status...</p>
					) : (
						<div className="space-y-4">
							{visibleRows.map((item, index) => {
								const hasContent = !!item.meta || item.photos.length > 0;
								const isRowCollapsed = !!collapsedRows[item.title];

								return (
									<div key={item.title}>
										<div className="relative flex gap-3">
											<div className="relative flex w-6 justify-center">
												<span className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2D63EA] text-white">
													<FiUser className="h-3.5 w-3.5" />
												</span>
												{index < visibleRows.length - 1 || isPullListOpen || showAdditionalMaterial ? (
													<span className="bg-brand-dark20 absolute top-6 h-[calc(100%+10px)] w-px" />
												) : null}
											</div>
											<div className="min-w-0 flex-1 space-y-2">
												<div className="flex items-center justify-between gap-2">
													<div className="flex flex-wrap items-center gap-2">
														<p className="text-sm font-semibold text-brand-dark">{item.title}</p>
														<span
															className={`rounded-full px-4 py-1 text-center text-[10px] font-semibold uppercase ${item.statusClassName}`}
														>
															{item.status}
														</span>
													</div>
													{hasContent && (
														<button
															type="button"
															onClick={() => toggleRow(item.title)}
															className="shrink-0 text-brand-dark50"
														>
															{isRowCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
														</button>
													)}
												</div>
												{!isRowCollapsed && (
													<>
														{item.meta ? <p className="text-xs font-normal text-[#64748B]">{item.meta}</p> : null}
														<MaterialStatusPhotos photos={item.photos} onOpenImagePreview={onOpenImagePreview} />
														{item.title === DELIVERY_STATUS_ROW_TITLE && (
															<div className="mt-3 space-y-3 rounded-[10px] border border-brand-dark10 p-4">
																<div className="flex items-center justify-between gap-2 border-b border-brand-dark10 pb-2">
																	<p className="text-xs font-semibold uppercase tracking-wide text-brand-greyLight">
																		Crate Activity History
																	</p>
																	{crateActivityRows.length > 0 && (
																		<Button
																			type="button"
																			variant="ghost"
																			onClick={() => setIsCrateActivityCollapsed((prev) => !prev)}
																			className="flex h-auto shrink-0 items-center gap-1 px-2 py-1 text-xs font-medium text-brand-dark hover:bg-gray-50"
																		>
																			{isCrateActivityCollapsed ? (
																				<>
																					Expand All <ChevronDown className="h-3.5 w-3.5" />
																				</>
																			) : (
																				<>
																					Collapse All <ChevronUp className="h-3.5 w-3.5" />
																				</>
																			)}
																		</Button>
																	)}
																</div>
																{isCrateActivityLoading ? (
																	<p className="text-xs text-brand-dark50">Loading crate activity...</p>
																) : crateActivityRows.length === 0 ? (
																	<p className="text-xs text-brand-dark50">No crate activity found for this task.</p>
																) : !isCrateActivityCollapsed ? (
																	<div className="space-y-3">
																		{crateActivityRows.map((crateRow, crateIndex) => (
																			<div key={crateRow.id} className="relative flex gap-3">
																				<div className="relative flex w-5 justify-center">
																					<span className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D63EA] text-white">
																						<FiPackage className="h-3 w-3" />
																					</span>
																					{crateIndex < crateActivityRows.length - 1 ? (
																						<span className="bg-brand-dark20 absolute top-5 h-[calc(100%+8px)] w-px" />
																					) : null}
																				</div>
																				<div className="min-w-0 flex-1 space-y-0.5 pb-0.5">
																					<p className="text-xs font-semibold text-brand-dark">{crateRow.title}</p>
																					<p className="text-[11px] font-normal text-[#64748B]">{crateRow.meta}</p>
																				</div>
																			</div>
																		))}
																	</div>
																) : null}
															</div>
														)}
													</>
												)}
											</div>
										</div>

										{index === 0 && isPullListOpen && (
											<div className="ml-3 mt-3 min-w-0 sm:ml-9">
												<JobLevelPullListTemplate
													jobnum={jobId}
													tsknum={phaseTsknum}
													hideHeader={true}
													searchInputClassName="w-[220px]"
												/>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}

					{showAdditionalMaterial && (
						<div className="relative flex gap-3 pt-2">
							<div className="relative flex w-6 justify-center">
								<span className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2D63EA] text-white">
									<FiUser className="h-3.5 w-3.5" />
								</span>
							</div>
							<div className="min-w-0 flex-1 space-y-3">
								<p className="text-sm font-semibold text-brand-dark">Additional Material</p>
								<div className="border-t border-brand-dark10 pt-3">
									<JobLevelAdditionalMaterialList recnum={jobId} tsknum={phaseTsknum} />
								</div>
							</div>
						</div>
					)}

					{!isCollapsed && (
						<div className="flex justify-start py-4">
							<Button
								onClick={handleRequestAdditionalMaterial}
								disabled={!canRequestMaterial}
								title={
									!canRequestMaterial ? "No daily job record available for this phase." : "Request Additional Material"
								}
								className="h-9 rounded-[10px] bg-black px-2 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
							>
								Request Additional Material
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
