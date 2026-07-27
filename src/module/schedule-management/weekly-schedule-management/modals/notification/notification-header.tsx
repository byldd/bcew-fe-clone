import React from "react";
import { PiCheck } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { IoClose } from "react-icons/io5";
import Image from "next/image";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NOTIFICATION_TYPE } from "@/types/notification";
import { ADMIN_NOTIFICATION_GROUP } from "@/module/admin/notifications/types/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
const NotificationHeader = ({
	onCloseSheet,
	notificationTypes,
	setNotificationTypes,
}: {
	onCloseSheet: () => void;
	notificationTypes: NOTIFICATION_TYPE[] | undefined;
	setNotificationTypes: (types: NOTIFICATION_TYPE[] | undefined) => void;
}) => {
	const notificationTypeEntries = Object.entries(ADMIN_NOTIFICATION_GROUP).map(([key, value]) => ({
		key,
		value,
	}));
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<div className="flex items-center justify-between gap-2">
			<p className="truncate text-xl font-bold text-brand-dark sm:text-2xl">{tschedule.notifications}</p>

			<div className="flex shrink-0 items-center gap-1">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className="relative h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 hover:bg-white"
							variant={"outline"}
						>
							<Image src={"/assets/svg/filter.svg"} alt={"filter"} width={25} height={25} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="min-w-[min(300px,calc(100vw-4rem))] rounded-[10px] border-none p-0 shadow-[-4px_4px_12px_0px_#21212140]"
					>
						{notificationTypeEntries.map(({ key, value }) => (
							<DropdownMenuItem
								className="cursor-pointer capitalize"
								key={key}
								onClick={() => {
									if (notificationTypes && notificationTypes.includes(key as NOTIFICATION_TYPE)) {
										setNotificationTypes(notificationTypes.filter((t) => t !== key));
										return;
									}
									setNotificationTypes([...(notificationTypes || []), key as NOTIFICATION_TYPE]);
								}}
							>
								{value}
								{notificationTypes && notificationTypes.includes(key as NOTIFICATION_TYPE) && (
									<PiCheck className="h-4 w-4" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<Button variant="ghost" size="icon" onClick={onCloseSheet}>
					<IoClose className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default NotificationHeader;
