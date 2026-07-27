"use client";

import { useModal } from "@/hooks/useModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { IoFunnelOutline } from "react-icons/io5";
import TimeRequestFilterModal from "./time-request-filter-modal";
import { ITimeRequestFilterTriggerProps } from "../utils/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export default function TimeRequestFilterTrigger({
	requestStatus,
	requestType,
	onApply,
}: ITimeRequestFilterTriggerProps) {
	const { openModal, closeModal, Modal } = useModal();
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	return (
		<div>
			<Tooltip>
				<TooltipTrigger>
					<div
						onClick={() =>
							openModal({
								modalTitle: tTimeLogs.timeRequestFilters,
								subHeader: tTimeLogs.timeRequestFilters,
								variant: "medium",
								modalView: (
									<TimeRequestFilterModal
										defaultRequestStatus={requestStatus}
										defaultRequestType={requestType}
										onApply={onApply}
										onClose={closeModal}
									/>
								),
							})
						}
						className="flex h-9 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-brand-dark10 bg-white p-[10px]"
					>
						<IoFunnelOutline />
					</div>
				</TooltipTrigger>
				<TooltipContent className="bg-black text-white">
					<p>{tTimeLogs.filter}</p>
					<TooltipArrow />
				</TooltipContent>
			</Tooltip>

			<Modal />
		</div>
	);
}
