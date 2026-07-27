"use client";
import React from "react";
import NotificationHeader from "../components/notification-header";
import NotificationList from "../components/notification-list";

const EmployeeNotification = () => {
	return (
		<div className="px-1 py-6">
			<NotificationHeader />
			<NotificationList />
		</div>
	);
};

export default EmployeeNotification;
