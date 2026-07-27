import { E_APPLICATION, IPage, IRolePagePermission, PAGE_POSITION } from "@/module/admin/types/sideb-bar-page";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IRole } from "@/module/employee/types";
import { IApiResponse } from "@/types";

export type IPageRolePermissionPayload = {
	roleId: string;
	accessLevel: ACCESS_LEVEL | null;
};

export type ICreatePagePayload = {
	name: string;
	parentPageId?: string;
	urlEndpoint?: string;
	rolePagePermissions?: IPageRolePermissionPayload[];
	positionFixed?: PAGE_POSITION;
	sortOrder?: number;
	iconUrl?: string;
	iconImageKey?: string;
	application?: E_APPLICATION;
	showInSidebar?: boolean;
};

export type IUpdatePagePayload = ICreatePagePayload;

export type IPageWithPermissions = IPage & {
	rolePagePermissions?: (IRolePagePermission & { role?: IRole })[];
};

export type IGetPagesResponse = IApiResponse<IPageWithPermissions[]>;
