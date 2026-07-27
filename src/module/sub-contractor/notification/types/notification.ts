import { IApiResponse, IPaginatedApiResponse, IPaginatedQuery } from "@/types";
import {
	INotification,
	ISubContractorCrewNotification,
	IUserNotification,
	NOTIFICATION_TYPE,
} from "@/types/notification";

export type ISubContractorNotificationFilters = IPaginatedQuery & {
	isRead?: boolean;
	type?: NOTIFICATION_TYPE | null;
	types?: NOTIFICATION_TYPE[] | null;
	createdAt?: string;
};

export type ISubContractorAdminGroupedNotificationResponse = IApiResponse<{
	items: {
		type: NOTIFICATION_TYPE;
		items: (IUserNotification & {
			notification: INotification;
		})[];
		total: number;
		unreadCount: number;
	}[];
}>;

export type ISubContractorAdminNotificationResponse = IApiResponse<
	IPaginatedApiResponse<
		(IUserNotification & {
			notification: INotification;
		})[]
	>
>;

export type ISubContractorCrewNotificationResponse = ISubContractorCrewNotification & {
	notification: INotification;
};

export type ISubCrewPushSubscription = {
	id: string;
	subcontractorCrewId: string;
	endpoint: string;
	p256dh: string;
	auth: string;
};
