"use client";
import React from "react";
import NotificationHeader from "../components/notification-header";
import SubContractorNotificationList from "../components/sub-contractor-notification-list";

const SubContractorAdminNotification = () => {
	return (
		<div className="rounded-[20px] border bg-white px-4 shadow-md">
			<NotificationHeader />

			<SubContractorNotificationList />
		</div>
	);
};

export default SubContractorAdminNotification;
