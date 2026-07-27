import { JobStatus } from "@/module/employee-dashboard/types";

export const legends = {
	newStart: "new_start",
	ongoingJob: "ongoing_job",
	lockedJob: "locked_job",
	subContractorJob: "sub_contractor_job",
	completed: "completed",
	carryOveredJob: "carry_overed_job",
	travelRelatedJob: "travel_related_job",
	validationWarning: "validation_warning",
	jobNotReady: "job_not_ready",
	autoRescheduledJob: "auto_rescheduled_job",
	manualOverride: "manual_override",
	training: "training",
	shadowing: "shadowing",
	builderUpdateTriggered: "builder_update_triggered",
	materialDependent: "material_dependent",
	warrantyJob: "warranty_job",
	// roughJob: "rough",
	// serviceJob: "service", // not in use for now
	// finalJob: "final",
	qcJob: "qc_job",
	rescheduledJob: "rescheduled_job",
} as const;

export const legendItems: { status: JobStatus; label: string; description?: string }[] = [
	{
		status: legends.newStart,
		label: "New Start",
		description: "Represents a fresh/new beginning.",
	},
	{ status: legends.ongoingJob, label: "Ongoing Job", description: "Implies continuity from a previous day." },
	{ status: legends.lockedJob, label: "Locked Job" },
	{
		status: legends.subContractorJob,
		label: "Sub-Contractor's Job",
		description: "Represents a job assigned to a sub-contractor.",
	},
	{ status: legends.completed, label: "Job Completed", description: "(QC team is auto-assigned)" },
	{
		status: legends.carryOveredJob,
		label: "Carry-Overed Job",
		description: "Represents a job that was carried over from a previous week.",
	},
	{ status: legends.travelRelatedJob, label: "Travel Related Job" },
	{ status: legends.validationWarning, label: "Validation Warning" },
	{ status: legends.jobNotReady, label: "Job Not Ready" },
	{ status: legends.autoRescheduledJob, label: "Auto-Rescheduled Job" },
	{ status: legends.manualOverride, label: "Manual Override" },
	{ status: legends.training, label: "Training" },
	{ status: legends.shadowing, label: "Shadowing" },
	{ status: legends.builderUpdateTriggered, label: "Builder Update Triggered" },
	{ status: legends.materialDependent, label: "Material Dependent" },
	{ status: legends.warrantyJob, label: "Warranty Job" },

	{ status: legends.qcJob, label: "QC Job", description: "Represents a QC job." },
	{ status: legends.rescheduledJob, label: "Rescheduled Job", description: "Represents a rescheduled job." },
];

export const statusColors: Record<JobStatus, string> = {
	[legends.newStart]: " border-green-500 border-2",
	[legends.rescheduledJob]: "border-2 border-purple-800",
	[legends.ongoingJob]: "border-gray-500 border-2",
	[legends.lockedJob]: "border-2 border-gray-700",
	[legends.subContractorJob]: "border-2 border-blue-400",
	[legends.completed]: "border-2 border-violet-500",
	[legends.carryOveredJob]: "border-2 border-red-500",
	[legends.travelRelatedJob]: "border-2 border-gray-700",
	[legends.validationWarning]: "border-2 border-yellow-500",
	[legends.jobNotReady]: "border-2 border-red-500",
	[legends.autoRescheduledJob]: "border-2 border-blue-400",
	[legends.manualOverride]: "border-2 border-gray-700",
	[legends.training]: "border-2 border-pink-500",
	[legends.shadowing]: "border-2 border-gray-500",
	[legends.builderUpdateTriggered]: "border-2 border-blue-500",
	[legends.materialDependent]: "border-2 border-blue-900",
	[legends.warrantyJob]: "border-2 border-brand-copper",
	[legends.qcJob]: "border-2 border-purple-500",
};

//  new mapping for text colors
export const statusTextColors: Record<JobStatus, string> = {
	[legends.rescheduledJob]: "text-purple-800",
	[legends.newStart]: "text-green-500",
	[legends.ongoingJob]: "text-gray-500",
	[legends.lockedJob]: "text-gray-700",
	[legends.subContractorJob]: "text-blue-400",
	[legends.completed]: "text-violet-500",
	[legends.carryOveredJob]: "text-red-500",
	[legends.travelRelatedJob]: "text-gray-700",
	[legends.validationWarning]: "text-yellow-500",
	[legends.jobNotReady]: "text-red-500",
	[legends.autoRescheduledJob]: "text-blue-400",
	[legends.manualOverride]: "text-gray-700",
	[legends.training]: "text-pink-500",
	[legends.shadowing]: "text-gray-500",
	[legends.builderUpdateTriggered]: "text-blue-500",
	[legends.materialDependent]: "text-blue-900",
	[legends.warrantyJob]: "text-brand-copper",
	[legends.qcJob]: "text-purple-500",
};

export const labelSelectionOrder = [
	legends.newStart,
	legends.rescheduledJob,
	legends.warrantyJob,
	legends.jobNotReady,
	legends.subContractorJob,
	legends.qcJob,
	legends.ongoingJob,
];
