import React from "react";
import SectionHeader from "@/components/shared/section-header";
import NotificationTypeFilter from "./notification-type-filter";
import NotificationDateFilter from "./notification-date-filter";
import ReadFilter from "./read-filter";
import PushNotification from "@/module/employee-notification/components/push-notification";
import { PushNotificationVariant } from "@/module/employee-notification/types/push-notifications";
import ViewSelect from "./view-select";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import AdminMarkAllRead from "./admin-mark-all-read";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";
import SubContractorAdminMarkAllRead from "@/module/sub-contractor/notification/components/sub-contractor-admin-mark-all-read";
import BackButton from "@/components/common/back-button";
import NotificationTeamFilter from "./notification-team-filter";
import { ADMIN_NOTIFICATION_GROUP } from "../types/type";
import { MODULE_GROUP_LABEL, MODULE_GROUP } from "../types/type";
import { SUB_CONTRACTOR_NOTIFICATION_GROUP } from "../types/type";

const NotificationHeader = ({ activeGroup }: { activeGroup: string | null; onBack: () => void }) => {
	const { user } = useAuthStore((state) => state);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<div className="flex flex-col gap-2 space-y-1 bg-brand-bgLightgrey50 pb-4">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3 py-1">
					{activeGroup && <BackButton />}

					<SectionHeader
						title={
							activeGroup
								? MODULE_GROUP_LABEL[activeGroup as MODULE_GROUP] ||
									ADMIN_NOTIFICATION_GROUP[activeGroup as keyof typeof ADMIN_NOTIFICATION_GROUP] ||
									SUB_CONTRACTOR_NOTIFICATION_GROUP[activeGroup as keyof typeof SUB_CONTRACTOR_NOTIFICATION_GROUP]
								: tschedule.notification
						}
						hideSidebarToggle={!!activeGroup}
					/>
				</div>
				<div className="no-scrollbar overflow-x-auto py-2">
					<div className="flex min-w-max items-center gap-2">
						{/* Push toggle — desktop only in top row; mobile gets its own row below */}
						{!activeGroup && (
							<div className="hidden lg:block">
								<PushNotification variant={PushNotificationVariant.ADMIN} />
							</div>
						)}

						{!activeGroup && (
							<div className="hidden lg:flex lg:items-center lg:gap-2">
								<ViewSelect />
							</div>
						)}
						<div className="hidden lg:flex lg:items-center lg:gap-2">
							<ReadFilter />
							<NotificationDateFilter />
							{!activeGroup && <NotificationTypeFilter />}
							{user?.userType === ROLES.SUB_CONTRACTOR ? <SubContractorAdminMarkAllRead /> : <AdminMarkAllRead />}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile: Push Notifications toggle on its own row */}
			{!activeGroup && (
				<div className="lg:hidden">
					<PushNotification variant={PushNotificationVariant.ADMIN} />
				</div>
			)}

			{!activeGroup && (
				<div className="no-scrollbar overflow-x-auto py-2 lg:hidden">
					<div className="flex min-w-max items-center gap-2">
						<ViewSelect />
						<ReadFilter />
						<NotificationDateFilter />
						<NotificationTypeFilter />
						{user?.userType === ROLES.SUB_CONTRACTOR ? <SubContractorAdminMarkAllRead /> : <AdminMarkAllRead />}
					</div>
				</div>
			)}

			{activeGroup && (
				<div className="no-scrollbar overflow-x-auto lg:hidden">
					<div className="flex min-w-max items-center gap-2">
						<ReadFilter />
						<NotificationDateFilter />
						{user?.userType === ROLES.SUB_CONTRACTOR ? <SubContractorAdminMarkAllRead /> : <AdminMarkAllRead />}
					</div>
				</div>
			)}

			{!activeGroup && (
				<div className="no-scrollbar overflow-x-auto pb-2">
					<div className="min-w-max">
						<NotificationTeamFilter />
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationHeader;
