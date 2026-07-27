import { useModal } from "@/hooks/useModal";
import React from "react";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IoFunnelOutline } from "react-icons/io5";
import EmployeeFilterModal from "./employee-filter-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const FilterTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	return (
		<div>
			<Tooltip>
				<TooltipTrigger>
					<div
						onClick={() =>
							openModal({
								modalTitle: tPmanagement.employeeFilters,
								subHeader: tPmanagement.sortEmployeeListByApplyingFilters,
								variant: "medium",
								modalView: <EmployeeFilterModal onClose={closeModal} />,
							})
						}
						className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-brand-dark10 bg-white p-[10px]"
					>
						<IoFunnelOutline />
					</div>
				</TooltipTrigger>
				<TooltipContent className="bg-black text-white">
					<p>{tPmanagement.filter}</p>
					<TooltipArrow />
				</TooltipContent>
			</Tooltip>
			<Modal />
		</div>
	);
};

export default FilterTrigger;
