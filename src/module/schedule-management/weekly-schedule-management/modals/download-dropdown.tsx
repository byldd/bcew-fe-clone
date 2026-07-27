"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useModal } from "@/hooks/useModal";
import DownloadConfirmModal from "./download-confirm-dialog";
import { SCHEDULE_DOWNLOAD_MODAL_TYPE } from "./enum";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const DownloadDropdown = () => {
	const { openModal, closeModal, Modal } = useModal();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const openDownloadConfirmModal = (type: SCHEDULE_DOWNLOAD_MODAL_TYPE) => {
		openModal({
			modalTitle:
				type === SCHEDULE_DOWNLOAD_MODAL_TYPE.SCHEDULE ? tschedule.downloadSchedule : tschedule.downloadPayroll,

			modalView: <DownloadConfirmModal type={type} onClose={closeModal} />,

			variant: "medium",
		});
	};

	return (
		<>
			<Modal />

			<Popover>
				<PopoverTrigger asChild>
					<span className="h-10 w-10 rounded-[10px]">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 outline-none hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
								>
									<Image
										src="/assets/svg/download.svg"
										alt="download"
										width={28}
										height={28}
										className="3xl:h-[56px] 3xl:w-[56px]"
									/>
								</Button>
							</TooltipTrigger>

							<TooltipContent>
								<p>{tschedule.download}</p>
							</TooltipContent>
						</Tooltip>
					</span>
				</PopoverTrigger>

				<PopoverContent align="end" className="w-[196px] p-0.5">
					<Button
						variant="ghost"
						className="w-full justify-start px-4 py-2 text-sm"
						onClick={() => openDownloadConfirmModal(SCHEDULE_DOWNLOAD_MODAL_TYPE.SCHEDULE)}
					>
						{tschedule.downloadSchedule}
					</Button>

					<Button
						variant="ghost"
						className="w-full justify-start px-4 py-2 text-sm"
						onClick={() => openDownloadConfirmModal(SCHEDULE_DOWNLOAD_MODAL_TYPE.PAYROLL)}
					>
						{tschedule.downloadPayroll}
					</Button>
				</PopoverContent>
			</Popover>
		</>
	);
};

export default DownloadDropdown;
