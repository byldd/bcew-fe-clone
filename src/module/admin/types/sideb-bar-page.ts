import { env } from "@/env.mjs";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IApiResponse } from "@/types";

export enum E_APPLICATION {
	BYLDD = "BYLDD",
	AKME = "AKME",
	LEGACY = "LEGACY",
}

export const E_APPLICATION_BASE_URL = {
	[E_APPLICATION.BYLDD]: env.NEXT_PUBLIC_BYLDD_BASE_URL,
	[E_APPLICATION.AKME]: env.NEXT_PUBLIC_AKME_BASE_URL,
	[E_APPLICATION.LEGACY]: env.NEXT_PUBLIC_LEGACY_BASE_URL,
};

export enum PAGE_POSITION {
	TOP = "TOP",
	BOTTOM = "BOTTOM",
}

export type IPage = {
	id: string;
	key: string;
	name: string;
	urlEndpoint: string;
	parentPageId: string;
	application: E_APPLICATION;
	showInSidebar: boolean;
	sortOrder: number;
	iconUrl?: string;
	iconKeyFile?: string;
	positionFixed?: PAGE_POSITION;
};

export type IRolePagePermission = {
	id: string;
	roleId: string;
	pageId: string;
	accessLevel?: ACCESS_LEVEL;
};

export type IGetAdminSidebarPages = IApiResponse<ISidebarPageNode[]>;

export type ISidebarPageNode = IPage & {
	rolePagePermission: IRolePagePermission;
	children: ISidebarPageNode[];
};

export type IGetPagesAccessResponse = Pick<IRolePagePermission, "accessLevel">;

export type IUpdateUserPageOrderRequest = {
	pageId: string;
	sortOrder: number;
}[];

export const SIDEBAR_PAGE_KEY = {
	NOTIFICATION: "notifications",
} as const;
