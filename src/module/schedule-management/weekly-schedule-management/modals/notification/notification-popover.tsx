import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetAdminNotifications } from "../../hooks/useSchedule";
import { useSheet } from "@/hooks/useSheet";
import AllNotificationsModal from "./all-notifications-modal";
import { useModal } from "@/hooks/useModal";
import { useAdminNotificationHandlers } from "../../hooks/useNotificationHandlers";
import { IGetAdminNotificationItem } from "../../types/schedule-interface";
import { cn } from "@/lib/utils/utils";
import { useAdminNotification } from "@/module/admin/context/admin-notification";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
const NotificationPopover = ({
	onSeeAllNotifications,
	notifications,
}: {
	onSeeAllNotifications: () => void;
	notifications: IGetAdminNotificationItem[];
}) => {
	const { openModal, closeModal, Modal } = useModal();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { handleNotificationClick } = useAdminNotificationHandlers({ openModal, closeModal });
	return (
		<DropdownMenuContent
			align="end"
			className="w-[calc(100vw-2rem)] rounded-[10px] border-none p-2 shadow-[-4px_4px_12px_0px_#21212140] sm:w-[360px]"
		>
			<DropdownMenuArrow className="fill-white" />
			<Modal />

			{notifications.map((notification, index) => (
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						handleNotificationClick({
							key: notification.key,
							data: notification.data,
						});
					}}
					key={index}
					className="cursor-pointer border-b border-brand-dark10 px-4 py-3 text-sm"
				>
					{notification.message}
				</DropdownMenuItem>
			))}
			<DropdownMenuItem
				onSelect={(e) => {
					e.preventDefault();
					onSeeAllNotifications();
				}}
				className="flex cursor-pointer justify-center py-2 text-center font-medium underline"
			>
				{tschedule.seeAllNotifications}
			</DropdownMenuItem>
		</DropdownMenuContent>
	);
};

const NotificationPopoverTrigger = () => {
	const { openSheet, Sheet, closeSheet } = useSheet();
	const [isOpen, setIsOpen] = useState(false);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { notificationCount } = useAdminNotification();

	const { data } = useGetAdminNotifications({
		page: 1,
		pageSize: 5,
	});

	const handleSeeAllNotifications = () => {
		setIsOpen(false);
		openSheet({
			sheetView: <AllNotificationsModal onCloseSheet={closeSheet} />,
			sheetTitle: tschedule.notifications,
			showDefaultClose: false,
			showDefaultHeader: false,
		});
	};

	return (
		<>
			<Sheet />
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<span className="h-10 w-10 rounded-[10px] active:shadow-[0px_4.34px_11.93px_0px_#00000040] data-[state=open]:shadow-[0px_4.34px_11.93px_0px_#00000040] 3xl:h-[80px] 3xl:w-[80px]">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="relative cursor-pointer">
									<Button
										className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 outline-none hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
										variant="outline"
									>
										<Image
											src={"/assets/svg/notification.svg"}
											alt={"bell"}
											width={28}
											height={28}
											className={cn("3xl:h-[56px] 3xl:w-[56px]")}
										/>
									</Button>
									{notificationCount > 0 && (
										<span className="absolute right-[4px] top-[3px] flex h-4 w-4 items-center justify-center rounded-full bg-brand-lightred text-[10px] font-semibold text-white">
											{notificationCount}
										</span>
									)}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>{tschedule.notifications}</p>
							</TooltipContent>
						</Tooltip>
					</span>
				</DropdownMenuTrigger>
				<NotificationPopover onSeeAllNotifications={handleSeeAllNotifications} notifications={data?.items || []} />
			</DropdownMenu>
		</>
	);
};

export default NotificationPopoverTrigger;
