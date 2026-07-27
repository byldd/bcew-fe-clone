import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import React from "react";
import ScheduleReminderModal from "../modals/schedule-coniguration/schedule-reminder-modal";
import DayTimeConfigurationModal from "../modals/day-time-config-modal";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import HolidayConfigModal from "../modals/holiday/holiday-config-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SettingPopoverTrigger = () => {
	const { Modal, closeModal, openModal } = useModal();
	const router = useRouter();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const handleHistoryClick = () => {
		router.push(routes.admin.scheduleHistory);
	};

	const handleConfigurationClick = () => {
		openModal({
			variant: "medium",
			modalTitle: tschedule.scheduleReminder,
			modalView: (
				<ScheduleReminderModal
					onClose={() => {
						closeModal();
					}}
				/>
			),
		});
	};
	const handleDayTimeClick = () => {
		openModal({
			variant: "medium",
			modalTitle: tschedule.dayTimeConfiguration,
			subHeader: tschedule.changeTimeSettingsHint,
			modalView: (
				<DayTimeConfigurationModal
					onClose={() => {
						closeModal();
					}}
				/>
			),
		});
	};

	const handleHolidaySpecialDayClick = () => {
		openModal({
			variant: "medium",
			modalTitle: tschedule.holidayAndSpecialDayConfiguration,
			modalView: <HolidayConfigModal />,
		});
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<span className="h-10 w-10 rounded-[10px] active:shadow-[0px_4.34px_11.93px_0px_#00000040] data-[state=open]:shadow-[0px_4.34px_11.93px_0px_#00000040] 3xl:h-[80px] 3xl:w-[80px]">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 outline-none hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
								>
									<Image
										src={"/assets/svg/settings.svg"}
										alt={"settings"}
										width={28}
										height={28}
										className="3xl:h-[56px] 3xl:w-[56px]"
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{tschedule.settings}</p>
							</TooltipContent>
						</Tooltip>
					</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					collisionPadding={16}
					className="min-w-[180px] rounded-[10px] border-none p-2 shadow-[-4px_4px_12px_0px_#21212140]"
				>
					<DropdownMenuArrow className="fill-white" />
					<DropdownMenuItem onClick={handleHistoryClick}>{tschedule.scheduleHistory}</DropdownMenuItem>
					<DropdownMenuItem onClick={handleConfigurationClick}>{tschedule.scheduleConfiguration}</DropdownMenuItem>
					<DropdownMenuItem onClick={handleDayTimeClick}>{tschedule.dayTimeConfiguration}</DropdownMenuItem>
					<DropdownMenuItem onClick={handleHolidaySpecialDayClick}>
						{tschedule.holidayAndSpecialDayConfiguration}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Modal />
		</>
	);
};

export default SettingPopoverTrigger;
