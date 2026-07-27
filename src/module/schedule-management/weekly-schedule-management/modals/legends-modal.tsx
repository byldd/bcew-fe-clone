"use client";

import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import { legendItems } from "@/module/employee-dashboard/constants/legend-items";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
const LegendModal = () => {
	return (
		<div>
			<ul className="space-y-3 text-sm">
				{legendItems.map((item) => (
					<li key={item.status} className="flex items-center gap-2">
						<span>{statusIcons[item.status]}</span>
						<span>{item.label}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

// export default LegendModal;

export default function LegendModalTrigger() {
	const { openModal, Modal } = useModal();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
						variant={"outline"}
						onClick={() =>
							openModal({
								variant: "medium",
								modalView: <LegendModal />,
								modalTitle: tschedule.legends,
								subHeader: tschedule.legendsDescription,
							})
						}
					>
						<Image
							src={"/assets/svg/I-icon.svg"}
							alt={"info"}
							width={28}
							height={28}
							className="3xl:h-[56px] 3xl:w-[56px]"
						/>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tschedule.legends}</p>
				</TooltipContent>
			</Tooltip>
			<Modal />
		</>
	);
}
