import { useModal } from "@/hooks/useModal";
import RerunModal from "./rerun-schedule-modal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
const RerunModalButton = () => {
	const { openModal, closeModal, Modal } = useModal();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<div>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
						variant={"outline"}
						onClick={() =>
							openModal({
								modalView: <RerunModal onClose={closeModal} />,
								modalTitle: tschedule.reRunTheSchedule,
								variant: "medium",
							})
						}
					>
						<Image
							src={"/assets/svg/replay-icon.svg"}
							alt={"replay-icon"}
							width={28}
							height={28}
							className="3xl:h-[56px] 3xl:w-[56px]"
						/>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tschedule.reRunTheSchedule}</p>
				</TooltipContent>
			</Tooltip>

			<Modal />
		</div>
	);
};

export default RerunModalButton;
