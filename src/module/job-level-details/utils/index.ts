import { toFormattedDate, toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import {
	JobLevelCommsDailyRecord,
	JobLevelCommsJob,
	JobLevelCommsJobNote,
	JobLevelCommsNote,
	JobLevelCommsPhase,
	JobLevelDetailsProject,
	JobMaterialStatusResponse,
	JobScheduleHistoryEntry,
	JobScheduleMilestoneKey,
	MaterialStatusRow,
	SchedulePhaseConfig,
	SchedulePhaseRow,
} from "./types";
import { FALLBACK } from "../constants";
import { routes } from "@/config/routes";
import { STATUS_DONE, STATUS_IN_PROGRESS, STATUS_PENDING } from "./constants";

export type FlattenedNote = JobLevelCommsNote & {
	recordDate: string;
};

export const getDateRange = (records: JobLevelCommsDailyRecord[]) => {
	if (!records.length) {
		return {
			start: FALLBACK,
			end: FALLBACK,
		};
	}

	const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	return {
		start: toFormattedDate(sorted[0]?.date || "", DATE_FORMAT.MM_SLASH_DD_YYYY),
		end: toFormattedDate(sorted[sorted.length - 1]?.date || "", DATE_FORMAT.MM_SLASH_DD_YYYY),
	};
};

export const formatScheduleDate = (value: string | Date | null | undefined, fallback = FALLBACK) => {
	if (!value) return fallback;
	if (value instanceof Date) {
		return toFormattedDate(value, DATE_FORMAT.MM_SLASH_DD_YYYY);
	}

	const parsed = new Date(value);
	if (!Number.isNaN(parsed.getTime())) {
		return toFormattedDate(parsed, DATE_FORMAT.MM_SLASH_DD_YYYY);
	}

	return value;
};

export const flattenRecordImages = (records: JobLevelCommsDailyRecord[]) => {
	return records.flatMap((record) => record.images);
};

export const flattenNotes = (records: JobLevelCommsDailyRecord[]) => {
	const notes: FlattenedNote[] = [];

	records.forEach((record) => {
		record.jobUpdateReasons.forEach((note) => {
			notes.push({
				...note,
				recordDate: record.date,
			});
		});
	});

	return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPhaseStatus = (phase: JobLevelCommsPhase) => {
	if (phase.completeDate) return "Completed";
	if (phase.jobDailyRecords.length > 0 || phase.qcJobs.some((qc) => qc.jobDailyRecords.length > 0))
		return "In Progress";
	return "Not Started";
};

export const getPhaseStatusClass = (status: string) => {
	if (status === "Completed") return "bg-green-100 text-green-700";
	if (status === "In Progress") return "bg-blue-100 text-blue-700";
	return "bg-gray-100 text-gray-600";
};

export const getJobStatus = (job: JobLevelCommsJob | null) => {
	if (!job) return "No Job Selected";
	const hasData = job.phases.length > 0 || job.workOrders.length > 0;
	if (!hasData) return "Not Started";
	const allPhasesComplete = job.phases.every((phase) => Boolean(phase.completeDate));
	const allWorkOrdersComplete = job.workOrders.every((wo) => Boolean(wo.completeDate));
	if (allPhasesComplete && allWorkOrdersComplete) return "Completed";
	return "In Progress";
};

export const getCurrentPhase = (job: JobLevelCommsJob | null) => {
	if (!job || !job.phases.length) return FALLBACK;
	const openPhase = job.phases.find((phase) => !phase.completeDate);
	return openPhase?.tsknme || job.phases[job.phases.length - 1]?.tsknme || FALLBACK;
};

export const getStatusDate = (phase: JobLevelCommsPhase) => {
	const latest = [...phase.jobDailyRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
	if (!latest) return FALLBACK;
	return toFormattedDate(latest.date, DATE_FORMAT.MM_SLASH_DD_YYYY);
};

export const getPhaseCrewLeader = (phase: JobLevelCommsPhase) => {
	for (const record of phase.jobDailyRecords) {
		const user = record.jobEmployeeAssignments?.[0]?.employee?.user;
		if (user?.name) {
			return { name: user.name, phone: user.cellPhone || FALLBACK };
		}
	}

	return { name: FALLBACK, phone: FALLBACK };
};

export const getForecastCompletionDate = (phase: JobLevelCommsPhase) => {
	const latestForecast = [...phase.jobDailyRecords]
		.filter((record) => Boolean(record.forecastDate))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

	return latestForecast?.forecastDate
		? toFormattedDate(latestForecast.forecastDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
		: FALLBACK;
};

export const getReadinessSummaryLabel = (phase: JobLevelCommsPhase) => {
	const readinessRecords = phase.jobDailyRecords.filter((record) => Boolean(record.notReadyUpdate));
	if (!readinessRecords.length) return null;

	const latest = [...readinessRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
	return latest?.notReadyUpdate?.isReady ? "Site was Marked Ready" : "Site Not Ready";
};

export const getJobNotes = (job: JobLevelCommsJob | null): JobLevelCommsJobNote[] => {
	if (!job) return [];

	const records: JobLevelCommsDailyRecord[] = [];
	for (const phase of job.phases) {
		records.push(...phase.jobDailyRecords);
		for (const qc of phase.qcJobs) {
			records.push(...qc.jobDailyRecords);
		}
	}
	for (const workOrder of job.workOrders) {
		records.push(...workOrder.jobDailyRecords);
	}

	const notesById = new Map<string, JobLevelCommsJobNote>();
	for (const record of records) {
		for (const note of record.notes ?? []) {
			notesById.set(note.id, note);
		}
	}

	return Array.from(notesById.values()).sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
};

export const getForemanAssigned = (job: JobLevelCommsJob | null) => {
	if (!job) return FALLBACK;

	for (const phase of job.phases) {
		for (const qc of phase.qcJobs) {
			const name = qc.jobDailyRecords[0]?.jobEmployeeAssignments?.[0]?.employee?.user?.name;
			if (name) return name;
		}
	}

	return FALLBACK;
};

const SCHEDULE_PHASE_CONFIG: SchedulePhaseConfig[] = [
	{
		key: "slabRough",
		label: "Slab Rough",
		scheduledKey: "slabRoughScheduled",
		startedKey: "slabRoughStarted",
		initialCompleteKey: "slabRoughInitialInstall",
		completeKey: "slabRoughMilestone",
		isFoundationApplicable: true,
		editHistoryId: "65985",
	},
	{
		key: "service",
		label: "Service",
		scheduledKey: "serviceScheduled",
		startedKey: "serviceStart",
		initialCompleteKey: "serviceInitialInstall",
		completeKey: "serviceCompleted",
		isFoundationApplicable: false,
		editHistoryId: "32564",
	},
	{
		key: "rough",
		label: "Rough",
		scheduledKey: "roughScheduled",
		startedKey: "roughStart",
		initialCompleteKey: "roughInitialInstall",
		completeKey: "roughCompleted",
		isFoundationApplicable: false,
		editHistoryId: "96523",
	},
	{
		key: "final",
		label: "Final",
		scheduledKey: "finalScheduled",
		startedKey: "finalStart",
		initialCompleteKey: "finalInitialInstall",
		completeKey: "finalCompleted",
		isFoundationApplicable: false,
		editHistoryId: "47589",
	},
	{
		key: "secondHit",
		label: "Second Hit",
		scheduledKey: "secondHitScheduled",
		initialCompleteKey: "secondHitInitialComplete",
		isFoundationApplicable: false,
		editHistoryId: "20135",
	},
];

export const buildSchedulePhaseRows = (entries?: JobScheduleHistoryEntry[] | null): SchedulePhaseRow[] => {
	const milestoneDates = new Map<JobScheduleMilestoneKey, string | null>();
	entries?.forEach((entry) => {
		milestoneDates.set(entry.milestoneKey, entry.newDate);
	});

	const formatMilestone = (key?: JobScheduleMilestoneKey) =>
		key ? formatScheduleDate(milestoneDates.get(key) ?? null) : FALLBACK;

	return SCHEDULE_PHASE_CONFIG.map((config) => ({
		key: config.key,
		label: config.label,
		// TODO: Foundation Complete is mocked until the backend provides it.
		foundationComplete: config.isFoundationApplicable ? "Yes" : null,
		isFoundationApplicable: config.isFoundationApplicable,
		scheduled: formatMilestone(config.scheduledKey),
		started: formatMilestone(config.startedKey),
		initialComplete: formatMilestone(config.initialCompleteKey),
		complete: formatMilestone(config.completeKey),
		editHistoryId: config.editHistoryId,
		historyMilestoneKey: config.scheduledKey,
	}));
};

export const buildOverview = (projects: JobLevelDetailsProject[], selectedItem: JobLevelCommsJob | null) => {
	if (!selectedItem) {
		return {
			builderName: FALLBACK,
			projectName: FALLBACK,
		};
	}

	for (const project of projects) {
		const exists = project.jobs.some((job) => job.jobId === selectedItem.jobId);
		if (exists) {
			return {
				builderName: selectedItem.builderName || FALLBACK,
				projectName: project.projectName,
			};
		}
	}

	return {
		builderName: FALLBACK,
		projectName: FALLBACK,
	};
};

export const formatScheduleHistoryDateTime = (value: string | null | undefined) => {
	if (!value) return FALLBACK;
	const parsed = new Date(value);
	if (!Number.isNaN(parsed.getTime())) {
		return toFormattedDate(parsed, DATE_FORMAT.DATE_AND_TIME);
	}
	return value;
};

export const parseNumberParam = (value: string | null) => {
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
};

export const formatQuantity = (value: number | null | undefined) => {
	return value === null || value === undefined ? FALLBACK : value.toString();
};

export const getStockStatus = (value: number | null | undefined) => {
	if (value === null || value === undefined) {
		return { label: FALLBACK, className: "bg-slate-100 text-slate-500" };
	}

	if (value === 1) {
		return { label: "In-Stock", className: "bg-emerald-100 text-emerald-700" };
	}

	return { label: "Out-of-Stock", className: "bg-amber-100 text-amber-700" };
};

const formatMeta = (date: string | null, userLabel?: string, user?: string | null) => {
	const parts: string[] = [];
	if (date) {
		parts.push(toLocalFormattedDate(date, DATE_FORMAT.DATE_AND_TIME));
	}
	if (userLabel) {
		parts.push(`${userLabel} : ${user || "--"}`);
	}
	return parts.join(" | ");
};

export const buildRows = (data: JobMaterialStatusResponse): MaterialStatusRow[] => [
	{
		title: "Pull List",
		status: "Created",
		statusClassName: STATUS_DONE,
		meta: formatMeta(data.pullList.date, "Employee Name", data.pullList.user),
		photos: [],
	},
	{
		title: "Material Pulled from Warehouse",
		status: data.pulled.done ? "Pulled" : "Pending",
		statusClassName: data.pulled.done ? STATUS_DONE : STATUS_PENDING,
		meta: formatMeta(data.pulled.date, "Warehouse Employee", data.pulled.user),
		photos: data.pulled.photos.map(routes.bcew.todoPhoto),
	},
	{
		title: "Material Validation",
		status: data.validated.done ? "Validated" : "Pending",
		statusClassName: data.validated.done ? STATUS_DONE : STATUS_PENDING,
		meta: formatMeta(data.validated.date, "Warehouse Employee", data.validated.user),
		photos: data.validated.photos.map(routes.bcew.todoPhoto),
	},
	{
		title: "Package Loaded for Delivery",
		status: data.loaded.done ? "Loaded" : "In-Progress",
		statusClassName: data.loaded.done ? STATUS_DONE : STATUS_IN_PROGRESS,
		meta: formatMeta(data.loaded.date),
		photos: [],
	},
	{
		title: "Delivery Status",
		status: data.delivered.done ? "Delivered" : "Pending",
		statusClassName: data.delivered.done ? STATUS_DONE : STATUS_PENDING,
		meta: formatMeta(data.delivered.date),
		photos: data.delivered.picpath ? [routes.bcew.warehousePhoto(data.delivered.picpath)] : [],
	},
];
