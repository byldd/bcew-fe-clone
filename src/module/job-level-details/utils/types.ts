import type {
	BuilderCommsDailyRecord,
	BuilderCommsImage,
	BuilderCommsJob,
	BuilderCommsJobNote,
	BuilderCommsNote,
	BuilderCommsNotReadyNote,
	BuilderCommsPhase,
	BuilderCommsProject,
	BuilderCommsQcJob,
	BuilderCommsWorkOrder,
} from "@/module/builder-communication/types";
import type { IAdminCrateActivityItem } from "@/module/admin-crate-activity/types";
import { ReactNode } from "react";

export type JobLevelCommsImage = BuilderCommsImage;

export type JobLevelCommsNote = BuilderCommsNote;

export type JobLevelCommsJobNote = BuilderCommsJobNote;

export type JobLevelCommsNotReadyNote = BuilderCommsNotReadyNote;

export type JobLevelCommsDailyRecord = BuilderCommsDailyRecord;

export type JobLevelCommsQcJob = BuilderCommsQcJob;

export type JobLevelCommsPhase = BuilderCommsPhase;

export type JobLevelCommsWorkOrder = BuilderCommsWorkOrder;

export type JobScheduleMilestoneKey =
	| "slabRoughScheduled"
	| "slabRoughStarted"
	| "serviceScheduled"
	| "roughScheduled"
	| "finalScheduled"
	| "secondHitScheduled"
	| "serviceStart"
	| "roughStart"
	| "finalStart"
	| "serviceCompleted"
	| "roughCompleted"
	| "finalCompleted"
	| "serviceConfirmReady"
	| "roughConfirmReady"
	| "finalConfirmReady"
	| "secondHitConfirmReady"
	| "serviceMaterialPulled"
	| "roughMaterialPulled"
	| "finalMaterialPulled"
	| "secondHitInitialComplete"
	| "secondHitMaterialPulled"
	| "serviceQcReady"
	| "roughQcReady"
	| "finalQcReady"
	| "serviceInspectionScheduled"
	| "roughInspectionScheduled"
	| "secondHitInspectionScheduled"
	| "serviceInspectionCompleted"
	| "roughInspectionCompleted"
	| "finalInspectionCompleted"
	| "serviceQcReviewCompleted"
	| "roughQcReviewCompleted"
	| "secondHitQcReviewCompleted"
	| "serviceMilestone"
	| "roughMilestone"
	| "finalMilestone"
	| "slabRoughMilestone"
	| "serviceInitialInstall"
	| "roughInitialInstall"
	| "finalInitialInstall"
	| "slabRoughInitialInstall"
	| "deliveredOn";

export type JobScheduleOverview = {
	department: number | null;
	model: string | null;
	buildingJobNumber: string | null;
	jobNotes: string | null;
	milestones: Partial<Record<JobScheduleMilestoneKey, string | null>>;
};

export type JobScheduleHistoryEntry = {
	milestoneKey: JobScheduleMilestoneKey;
	milestoneLabel: string;
	oldDate: string | null;
	newDate: string | null;
	user: string | null;
	changedAt: string | null;
};

export type JobScheduleHistoryResponse = {
	jobId: number;
	jobName: string;
	entries: JobScheduleHistoryEntry[];
};

export type JobPullListItem = {
	jobnum: number | null;
	prtnum: number | null;
	binnum: string | null;
	prtdsc: string | null;
	csttyp: number | null;
	linqty: number | null;
	linprc: number | null;
	rcvdte: number | null;
	cntqty: number | null;
	tsknum: number | null;
	tsknme: string | null;
	vendor: string | null;
	ponum: number | null;
	alpnum?: string | null;
	untdsc?: string | null;
	extttl?: number | null;
	orddte?: string | null;
	deldte?: string | null;
	poNote?: string | null;
};

export type JobPullListTakeoffItem = {
	jobnum: number | null;
	prtnum: number | null;
	prtdsc: string | null;
	partName: string | null;
	binnum: string | null;
	unit: string | null;
	inStock: number | null;
	cntqty: number | null;
	linqty: number | null;
	linprc: number | null;
	rcvdte: number | null;
	vendor: string | null;
	stockItem: number | null;
	partCostType: number | null;
	avgCost: number | null;
	takeoffLineCount: number | null;
	lastTakeoffDate: string | null;
	builderNum: number | null;
	builderName: string | null;
	clientNum: number | null;
	clientName: string | null;
	jobName: string | null;
};

export type JobPullListResponse = {
	jobnum: number;
	tsknum: number;
	items: JobPullListItem[];
	takeoffItems?: JobPullListTakeoffItem[];
};

export type JobLevelCommsJob = BuilderCommsJob & {
	JobLevelName?: string;
	schedule?: JobScheduleOverview | null;
};

export type JobLevelCommsProject = BuilderCommsProject;

export type JobLevelCommsJobLevel = {
	JobLevelName: string;
	projects: JobLevelCommsProject[];
};

export type JobLevelCommsTreeResponse = JobLevelCommsJobLevel[];

export type JobLevelDetailsProject = BuilderCommsProject;

export type JobLevelDetailsProjectTreeResponse = JobLevelDetailsProject[];

export type CategoryGroup = {
	projectName: string;
	jobs: JobLevelCommsJob[];
};

export type JobLevelDetailsSidebarProps = {
	categoryGroups: CategoryGroup[];
	openCategories: string[];
	onOpenCategoriesChange: (values: string[]) => void;
	selectedItem: JobLevelCommsJob | null;
	onSelectJob: (item: JobLevelCommsJob) => void;
	getVisibleJobs: (category: string) => number;
	onLoadMoreJobs: (category: string) => void;
};

export type JobLevelDetailsProps = {
	projects: JobLevelDetailsProject[];
	selectedItem: JobLevelCommsJob | null;
	setSelectedItem: (item: JobLevelCommsJob) => void;
	searchQuery: string;
};

export type SchedulePhaseKey = "slabRough" | "service" | "rough" | "final" | "secondHit";

export type SchedulePhaseFilterKey = SchedulePhaseKey | "all";

export type SchedulePhaseRow = {
	key: SchedulePhaseKey;
	label: string;
	foundationComplete: string | null;
	isFoundationApplicable: boolean;
	scheduled: string;
	started: string;
	initialComplete: string;
	complete: string;
	editHistoryId: string;
	historyMilestoneKey: JobScheduleMilestoneKey;
};

export type JobLevelScheduleMilestonesProps = {
	rows: SchedulePhaseRow[];
	onOpenHistory: () => void;
	onOpenPhaseHistory: (key: JobScheduleMilestoneKey) => void;
};

export type ImportantDocument = {
	id: string;
	title: string;
	meta: string;
};

export type JobLevelPullListTemplateProps = {
	jobnum?: number | null;
	tsknum?: number | null;
	hideHeader?: boolean;
	searchInputClassName?: string;
};

export type BaseStepStatus = {
	done: boolean;
	date: string | null;
};

export type VerifiedStepStatus = BaseStepStatus & {
	user: string | null;
	photos: string[];
};

export type DeliveryStepStatus = BaseStepStatus & {
	picpath: string | null;
};

export type JobMaterialStatusResponse = {
	recnum: number;
	tsknum: number;
	pullList: {
		created: boolean;
		date: string | null;
		user: string | null;
	};
	pulled: VerifiedStepStatus;
	validated: VerifiedStepStatus;
	loaded: BaseStepStatus;
	delivered: DeliveryStepStatus;
};

export type MaterialStatusRow = {
	title: string;
	status: string;
	statusClassName: string;
	meta: string;
	photos: string[];
};

export type JobLevelCrateActivityItem = Pick<
	IAdminCrateActivityItem,
	"id" | "scanned_crate" | "scan_action" | "scanned_date" | "user"
>;

export type CrateActivityRow = {
	id: string;
	title: string;
	meta: string;
};

export type JobLevelCollapsibleSectionProps = {
	title: string;
	headerMeta?: ReactNode;
	headerActions?: ReactNode;
	defaultOpen?: boolean;
	expandLabel?: string;
	collapseLabel?: string;
	className?: string;
	children: ReactNode;
};

export type SchedulePhaseConfig = {
	key: SchedulePhaseKey;
	label: string;
	scheduledKey: JobScheduleMilestoneKey;
	startedKey?: JobScheduleMilestoneKey;
	initialCompleteKey?: JobScheduleMilestoneKey;
	completeKey?: JobScheduleMilestoneKey;
	isFoundationApplicable: boolean;
	// TODO: Replace with the real Job Edit History reference once the backend exposes it.
	editHistoryId: string;
};
