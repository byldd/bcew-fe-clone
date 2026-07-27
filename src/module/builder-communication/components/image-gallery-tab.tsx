"use client";

import Image from "next/image";
import { toFormattedDate } from "@/lib/utils/date";
import { useModal } from "@/hooks/useModal";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { cn } from "@/lib/utils/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	BuilderCommsBuilder,
	BuilderCommsJob,
	BuilderCommsDailyRecord,
	BuilderCommsQcJob,
	BuilderCommsWorkOrder,
	BUILDER_COMMS_PHASE_TYPE,
} from "../types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaArrowRightLong } from "react-icons/fa6";
import { PanelLeftOpen, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

import { hasAnyImagesInTab, hasAnyNotesInTab } from "../utils/helpers";
import { JOB_HIERARCHY_LIMIT } from "../constants";
import { DATE_FORMAT } from "@/types/date";

type Props = {
	builders: BuilderCommsBuilder[];
	selectedItem: BuilderCommsJob | null;
	setSelectedItem: (item: BuilderCommsJob) => void;
	searchQuery: string;
	sidebarOpen?: boolean;
	onCloseSidebar?: () => void;
};

export default function ImageGalleryTab({
	builders,
	selectedItem,
	setSelectedItem,
	searchQuery,
	sidebarOpen = false,
	onCloseSidebar,
}: Props) {
	const isMobile = useIsMobile();
	const [openBuilders, setOpenBuilders] = useState<string[]>([]);
	const [openProjects, setOpenProjects] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState("");

	const [visibleProjects, setVisibleProjects] = useState<Record<string, number>>({});
	const [visibleJobs, setVisibleJobs] = useState<Record<string, number>>({});

	const tBuilderCommunication = useTypedTranslations(NAMESPACE.BUILDER_COMMUNICATION);
	const { openModal, closeModal, Modal } = useModal();

	// ── Helpers ──────────────────────────────────────────────────────────────

	const getVisibleProjects = (builderName: string) => visibleProjects[builderName] ?? JOB_HIERARCHY_LIMIT;
	const getVisibleJobs = (projectName: string) => visibleJobs[projectName] ?? JOB_HIERARCHY_LIMIT;

	const loadMoreProjects = (builderName: string) => {
		setVisibleProjects((prev) => ({
			...prev,
			[builderName]: (prev[builderName] ?? JOB_HIERARCHY_LIMIT) + JOB_HIERARCHY_LIMIT,
		}));
	};

	const loadMoreJobs = (projectName: string) => {
		setVisibleJobs((prev) => ({
			...prev,
			[projectName]: (prev[projectName] ?? JOB_HIERARCHY_LIMIT) + JOB_HIERARCHY_LIMIT,
		}));
	};

	useEffect(() => {
		setVisibleProjects({});
		setVisibleJobs({});
	}, [builders]);

	useEffect(() => {
		if (!searchQuery) {
			setOpenBuilders([]);
			setOpenProjects([]);
			return;
		}

		const b: string[] = [];
		const p: string[] = [];

		builders.forEach((builder) => {
			b.push(builder.builderName);
			builder.projects.forEach((proj) => p.push(proj.projectName));
		});

		setOpenBuilders(b);
		setOpenProjects(p);
	}, [builders, searchQuery]);

	// ── Phase tabs ────────────────────────────────────────────────────────────

	const tabs = useMemo(() => {
		if (!selectedItem) return [];
		const phaseTabs = selectedItem.phases.map((p) => p.tsknme);
		const hasWorkOrders = selectedItem.workOrders.length > 0;
		return hasWorkOrders ? [...phaseTabs, BUILDER_COMMS_PHASE_TYPE.WORK_ORDER] : phaseTabs;
	}, [selectedItem]);

	useEffect(() => {
		if (tabs.length) setActiveTab(tabs[0] || "");
	}, [tabs]);

	// ── Tab data ──────────────────────────────────────────────────────────────

	const getTabData = (): {
		records: BuilderCommsDailyRecord[];
		qc: BuilderCommsQcJob[];
		workOrders: BuilderCommsWorkOrder[];
	} => {
		if (!selectedItem) return { records: [], qc: [], workOrders: [] };

		if (activeTab === BUILDER_COMMS_PHASE_TYPE.WORK_ORDER) {
			return { workOrders: selectedItem.workOrders, records: [], qc: [] };
		}

		const phase = selectedItem.phases.find((p) => p.tsknme === activeTab);
		return { records: phase?.jobDailyRecords || [], qc: phase?.qcJobs || [], workOrders: [] };
	};

	const { records, qc, workOrders } = getTabData();

	const handleJobSelect = (job: BuilderCommsJob) => {
		setSelectedItem(job);
		if (isMobile) onCloseSidebar?.();
	};

	const sidebarBody = (
		<div className="flex h-full flex-col overflow-y-auto">
			{/* Header row */}
			<div className="flex items-center justify-between px-3 py-3">
				<h1 className="ml-2 py-2 text-sm font-medium text-brand-dark50">{tBuilderCommunication.selectBuilder}</h1>
				{isMobile && (
					<button
						onClick={onCloseSidebar}
						className="flex h-8 w-8 items-center justify-center rounded-md text-brand-dark50 transition-colors hover:bg-gray-100 active:bg-gray-200"
						aria-label="Close sidebar"
					>
						<X size={16} />
					</button>
				)}
			</div>

			{/* Builder accordion tree */}
			<Accordion type="multiple" value={openBuilders} onValueChange={setOpenBuilders}>
				{builders.map((builder) => {
					const visibleProjectList = builder.projects.slice(0, getVisibleProjects(builder.builderName));

					return (
						<AccordionItem key={builder.builderName} value={builder.builderName}>
							<AccordionTrigger className="px-4 font-inter text-sm font-medium text-brand-dark80">
								{builder.builderName}
							</AccordionTrigger>

							<AccordionContent>
								{visibleProjectList.map((project) => {
									const visibleJobList = project.jobs.slice(0, getVisibleJobs(project.projectName));

									return (
										<Accordion
											key={project.projectName}
											type="multiple"
											value={openProjects}
											onValueChange={setOpenProjects}
										>
											<AccordionItem value={project.projectName}>
												<AccordionTrigger className="ml-4 px-2 font-inter text-sm font-medium text-brand-dark">
													{project.projectName}
												</AccordionTrigger>

												<AccordionContent>
													{visibleJobList.map((job) => (
														<div
															key={job.jobId}
															onClick={() => handleJobSelect(job)}
															className="ml-6 flex min-h-[44px] cursor-pointer items-center justify-between rounded-[8px] px-3 py-3 text-sm transition-colors hover:bg-brand-dark10 active:bg-brand-dark10"
														>
															<span className="font-inter text-sm font-medium text-brand-dark">{job.jobName}</span>
															<FaArrowRightLong className="shrink-0 text-brand-grey" />
														</div>
													))}

													{project.jobs.length > getVisibleJobs(project.projectName) && (
														<div
															onClick={() => loadMoreJobs(project.projectName)}
															className="ml-6 cursor-pointer px-3 py-2 text-sm text-black hover:underline"
														>
															See more jobs
														</div>
													)}
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									);
								})}

								{builder.projects.length > getVisibleProjects(builder.builderName) && (
									<div
										onClick={() => loadMoreProjects(builder.builderName)}
										className="cursor-pointer px-3 py-2 text-xs text-black hover:underline"
									>
										See more projects
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>
		</div>
	);

	return (
		<div className="relative min-h-[500px] lg:grid lg:h-[700px] lg:grid-cols-[280px_1fr] lg:gap-4">
			{!isMobile && <div className="overflow-y-auto rounded-lg border bg-white">{sidebarBody}</div>}

			{isMobile && (
				<>
					{sidebarOpen && <div className="absolute inset-0 z-10 bg-black/20" onClick={onCloseSidebar} />}

					{/* Sidebar panel */}
					{sidebarOpen && (
						<div className="absolute left-0 top-0 z-20 h-full w-[280px] overflow-y-auto rounded-r-lg bg-white shadow-xl">
							{sidebarBody}
						</div>
					)}
				</>
			)}

			{/*  Main content area*/}
			<div className="mt-4 space-y-2 rounded-lg border bg-white px-4 lg:mt-0 lg:overflow-y-auto">
				<Modal />

				{!selectedItem && isMobile && (
					<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
							<PanelLeftOpen size={28} className="text-brand-dark50" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-semibold text-brand-dark">Select a Builder</p>
							<p className="text-xs leading-relaxed text-brand-dark50">
								Tap the panel icon at the top&#8209;right to browse builders, projects and jobs again.
							</p>
						</div>
					</div>
				)}

				<div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-3">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={cn(
								"h-10 shrink-0 rounded-[8px] px-4 text-sm",
								activeTab === tab ? "bg-black text-white" : "bg-gray-100"
							)}
						>
							{tab}
						</button>
					))}
				</div>

				{selectedItem?.jobName && <h2 className="text-sm font-medium text-brand-dark50">({selectedItem.jobName})</h2>}

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
					{/*  Images  */}
					<div className="space-y-2">
						{selectedItem && !hasAnyImagesInTab(activeTab, records, qc, workOrders) ? (
							<div className="flex h-40 items-center justify-center text-sm text-brand-dark50">No Images</div>
						) : (
							<>
								{records.map((r) => (
									<div key={r.id} className="space-y-3 py-3">
										<div className="text-sm text-brand-dark50">{toFormattedDate(r.date)}</div>
										<div className="flex flex-wrap gap-2">
											{r.images.map((img) => (
												<button
													key={img.id}
													onClick={() =>
														openModal({
															modalTitle: "Preview",
															modalView: <ImageModal imageUrl={img.url} onClose={closeModal} />,
															variant: "big",
														})
													}
													className="h-24 w-24 rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
												>
													<Image
														src={img.url}
														alt=""
														width={96}
														height={96}
														className="h-full w-full rounded-[20px] border object-cover"
													/>
												</button>
											))}
										</div>
									</div>
								))}

								{qc.length > 0 && (
									<div className="space-y-3 py-3">
										<h3 className="mb-2 text-sm font-semibold">QC Jobs</h3>
										{qc.map((q) =>
											q.jobDailyRecords.map((r) => (
												<div key={r.id} className="space-y-3 py-3">
													<div className="text-sm text-brand-dark50">
														{toFormattedDate(r.date)} {q.type}
													</div>
													<div className="flex flex-wrap gap-2">
														{r.images.map((img) => (
															<button
																key={img.id}
																onClick={() =>
																	openModal({
																		modalTitle: "Preview",
																		modalView: <ImageModal imageUrl={img.url} onClose={closeModal} />,
																		variant: "big",
																	})
																}
																className="h-20 w-20 rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
															>
																<Image
																	src={img.url}
																	alt=""
																	width={80}
																	height={80}
																	className="h-full w-full rounded-[20px] border object-cover"
																/>
															</button>
														))}
													</div>
												</div>
											))
										)}
									</div>
								)}

								{workOrders.map((wo) => (
									<div key={wo.id} className="space-y-3 py-3">
										<h3 className="text-sm font-semibold">{wo.ordnum}</h3>
										{wo.jobDailyRecords.map((r) => (
											<div key={r.id} className="space-y-3 py-3">
												<div className="text-sm text-brand-dark50">{toFormattedDate(r.date)}</div>
												<div className="flex flex-wrap gap-2">
													{r.images.map((img) => (
														<button
															key={img.id}
															onClick={() =>
																openModal({
																	modalTitle: "Preview",
																	modalView: <ImageModal imageUrl={img.url} onClose={closeModal} />,
																	variant: "big",
																})
															}
															className="h-20 w-20 rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
														>
															<Image
																src={img.url}
																alt=""
																width={80}
																height={80}
																className="h-full w-full rounded-[20px] border object-cover"
															/>
														</button>
													))}
												</div>
											</div>
										))}
									</div>
								))}
							</>
						)}
					</div>

					{/*  Notes */}
					{selectedItem && !hasAnyNotesInTab(activeTab, records, qc, workOrders) ? (
						<div className="flex h-40 items-center justify-center text-sm text-brand-dark50">No Notes</div>
					) : (
						<div className="space-y-3 pb-4">
							{records.map((r) => (
								<div key={r.id} className="space-y-3 py-3">
									<div className="text-sm text-brand-dark50">{toFormattedDate(r.date)}</div>

									{r.jobUpdateReasons.map((note) => (
										<div key={note.id} className="space-y-2 rounded-[12px] border p-3">
											<div className="flex items-start justify-between gap-2">
												<p className="min-w-0 text-sm font-medium leading-snug text-brand-dark">
													Employee Note — {note?.user?.name} (Job Status Note)
												</p>
												<p className="shrink-0 text-xs text-gray-500">
													{toFormattedDate(note?.createdAt, DATE_FORMAT.HH_MM_AA_PM)}
												</p>
											</div>
											<p className="text-justify text-xs font-normal text-brand-dark50">{note.reason}</p>
										</div>
									))}

									{r?.notReadyUpdate?.note && (
										<div className="space-y-2 rounded-[12px] border p-3">
											<div className="flex items-start justify-between gap-2">
												<p className="min-w-0 text-sm font-medium leading-snug text-brand-dark">
													Employee Note — {r.notReadyUpdate.user?.name ?? "Unknown"} (Job Status Note)
												</p>
												<p className="shrink-0 text-xs text-gray-500">
													{toFormattedDate(r.notReadyUpdate.createdAt, DATE_FORMAT.HH_MM_AA_PM)}
												</p>
											</div>
											<div className="text-justify text-xs font-normal text-brand-dark50">{r.notReadyUpdate.note}</div>
										</div>
									)}
								</div>
							))}

							{qc.length > 0 && (
								<div className="space-y-3 py-3">
									<h3 className="mb-2 text-sm font-semibold">QC Jobs</h3>
									{qc.map((q) =>
										q.jobDailyRecords.map((r) => (
											<div key={r.id} className="space-y-3 py-3">
												<div className="text-sm text-brand-dark50">
													{toFormattedDate(r.date)} ({q.type})
												</div>
												{r.jobUpdateReasons.map((note) => (
													<div key={note.id} className="space-y-2 rounded-[12px] border p-3">
														<div className="flex items-start justify-between gap-2">
															<p className="min-w-0 text-sm font-medium leading-snug text-brand-dark">
																Employee Note — {note?.user?.name} (Job Status Note)
															</p>
															<p className="shrink-0 text-xs text-gray-500">
																{toFormattedDate(note?.createdAt, DATE_FORMAT.HH_MM_AA_PM)}
															</p>
														</div>
														<div className="text-xs font-normal text-brand-dark50">{note.reason}</div>
													</div>
												))}
												{r?.notReadyUpdate?.note && (
													<div className="space-y-2 rounded-[12px] border p-3">
														<div className="flex items-start justify-between gap-2">
															<p className="min-w-0 text-sm font-medium leading-snug text-brand-dark">
																Employee Note — {r.notReadyUpdate.user?.name ?? "Unknown"} (Job Status Note)
															</p>
															<p className="shrink-0 text-xs text-gray-500">
																{toFormattedDate(r.notReadyUpdate.createdAt, DATE_FORMAT.HH_MM_AA_PM)}
															</p>
														</div>
														<div className="text-xs font-normal text-brand-dark50">{r.notReadyUpdate.note}</div>
													</div>
												)}
											</div>
										))
									)}
								</div>
							)}

							{workOrders.map((wo) => (
								<div key={wo.id} className="space-y-3 py-3">
									<h3 className="mb-2 text-sm font-semibold">{wo.ordnum}</h3>
									{wo.jobDailyRecords.map((r) => (
										<div key={r.id} className="space-y-3 py-3">
											<div className="text-sm text-brand-dark50">{toFormattedDate(r.date)}</div>
											{r.jobUpdateReasons.map((note) => (
												<div key={note.id} className="space-y-2 rounded-[12px] border p-3">
													<div className="flex items-start justify-between gap-2">
														<p className="min-w-0 text-sm font-medium leading-snug text-brand-dark">
															Employee Note — {note?.user?.name} (Job Status Note)
														</p>
														<p className="shrink-0 text-xs text-gray-500">
															{toFormattedDate(note?.createdAt, DATE_FORMAT.HH_MM_AA_PM)}
														</p>
													</div>
													<div className="text-xs font-normal text-brand-dark50">{note?.reason}</div>
												</div>
											))}
											{r?.notReadyUpdate?.note && (
												<div className="space-y-2 rounded-[12px] border p-3">
													<div className="flex items-start justify-between gap-2">
														<p className="min-w-0 text-sm font-medium leading-snug text-brand-dark">
															Employee Note — {r.notReadyUpdate.user?.name ?? "Unknown"} (Job Status Note)
														</p>
														<p className="shrink-0 text-xs text-gray-500">
															{toFormattedDate(r.notReadyUpdate.createdAt, DATE_FORMAT.HH_MM_AA_PM)}
														</p>
													</div>
													<div className="text-xs font-normal text-brand-dark50">{r.notReadyUpdate.note}</div>
												</div>
											)}
										</div>
									))}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
