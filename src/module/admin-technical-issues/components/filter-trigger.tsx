import { useModal } from "@/hooks/useModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import Image from "next/image";
import TechnicalIssuesFilter from "@/module/employee-technical-issue/report-technical-bug/components/technical-issues-filter";
import { Button } from "@/components/ui/button";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const FilterTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);

	return (
		<div>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						onClick={() =>
							openModal({
								modalTitle: tAdmin.filters,
								subHeader: tAdmin.sortDownByApplyingFilters,
								variant: "medium",
								modalView: <TechnicalIssuesFilter onClose={closeModal} />,
							})
						}
						className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-brand-dark10 bg-white p-[10px]"
					>
						<Image
							src="/assets/svg/filter.svg"
							alt="filter"
							width={28}
							height={28}
							className="3xl:h-[56px] 3xl:w-[56px]"
						/>
					</Button>
				</TooltipTrigger>

				<TooltipContent>{tAdmin.filter}</TooltipContent>
			</Tooltip>

			<Modal />
		</div>
	);
};

export default FilterTrigger;
