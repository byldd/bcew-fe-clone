"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { TECHNICAL_ISSUE_STATUS } from "@/utils/enums";
import { useUpdateTechnicalIssueStatus } from "../../schedule-management/roster-time-configuration/hooks/useRoster";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { formatEnumLabel } from "@/lib/utils/value-formatter";

type Props = {
	issueId: string;
	status: TECHNICAL_ISSUE_STATUS;
};
const statusStyles: Record<TECHNICAL_ISSUE_STATUS, string> = {
	OPEN: "bg-white text-[#151515] border border-[#E5E7EB]",
	IN_PROGRESS: "bg-[#FFFCE5] text-[#937823]",
	RESOLVED: "bg-[#E6F4EA] text-[#1E7F3C]",
	CANCELLED: "bg-[#F2F2F2] text-[#9CA3AF]",
	ON_HOLD: "bg-[#F2F2F2] text-[#9CA3AF]",
};

const STATUS_OPTIONS = Object.values(TECHNICAL_ISSUE_STATUS);

const StatusSelector = ({ issueId, status }: Props) => {
	const mutation = useUpdateTechnicalIssueStatus(issueId);
	const queryClient = useQueryClient();

	const handleStatusChange = (newStatus: TECHNICAL_ISSUE_STATUS) => {
		if (newStatus === status) return;

		mutation.mutate(newStatus, {
			onSuccess: () => {
				openSuccessToast(`Status updated to ${formatEnumLabel(newStatus)}`);
				queryClient.invalidateQueries({ queryKey: ["admin-technical-issues"] });
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className={`flex h-8 min-w-[90px] items-center justify-between gap-1 rounded-[6px] px-2 text-center text-xs font-medium ${statusStyles[status]}`}
					disabled={mutation.isPending}
				>
					{formatEnumLabel(status)}
					<ChevronDown size={14} />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-44 p-1">
				{STATUS_OPTIONS.map((option) => {
					if (option === TECHNICAL_ISSUE_STATUS.CANCELLED) return false;
					return (
						<Button
							key={option}
							size="sm"
							className={`w-full justify-start text-xs ${option === status ? "bg-brand-bgLightgrey font-semibold" : ""}`}
							disabled={mutation.isPending || option === status}
							onClick={() => handleStatusChange(option)}
						>
							{formatEnumLabel(option)}
						</Button>
					);
				})}
			</PopoverContent>
		</Popover>
	);
};

export default StatusSelector;
