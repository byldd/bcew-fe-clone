import { IPaginatedQuery } from "@/types";
import { INotification, IUserNotification, NOTIFICATION_TYPE } from "@/types/notification";

export type IEmployeeNotificationResponse = IUserNotification & {
	notification: INotification;
};

export type IEmployeeNotificationFilters = IPaginatedQuery & {
	isRead?: boolean;
	types?: NOTIFICATION_TYPE[];
	createdAt?: string;
};

export type IPushSubscription = {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
};
