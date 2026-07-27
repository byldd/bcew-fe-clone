import { JobStatus } from "@/module/employee-dashboard/types";
import { legends } from "./legend-items";

export const statusColors: Record<JobStatus, string> = {
	[legends.newStart]: " border-green-500 border-2",
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
	[legends.rescheduledJob]: "border-2 border-purple-500",
};
