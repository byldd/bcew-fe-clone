import { TECHNICAL_ISSUE_STATUS } from "@/utils/enums";

export const TICKET_STATUS_LABEL: Record<TECHNICAL_ISSUE_STATUS, { label: string; className: string }> = {
	OPEN: { label: "Open", className: "text-yellow-500" },
	IN_PROGRESS: { label: "In-Progress", className: "text-yellow-600" },
	RESOLVED: { label: "Resolved", className: "text-green-600" },
	CANCELLED: { label: "Cancelled", className: "text-gray-400" },
	ON_HOLD: { label: "On hold", className: "text-gray-400" },
};
