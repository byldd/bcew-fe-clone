import { modalBodyVariants } from "@/utils/constants";
import { MODULE } from "@/utils/enums";
import { IconType } from "react-icons/lib";

export type USER_TYPE = "USER" | "ADMIN" | "SUPER_ADMIN" | "SYSTEM";

export enum SORT_ORDER {
	ASC = "asc",
	DESC = "desc",
}

export enum FORM_MODE {
	CREATE = "CREATE",
	EDIT = "EDIT",
}

export type SignUpApiResponseType = {
	message: string;
	data: {
		data: {
			user: {
				name: {
					first: string;
					last: string;
				};
				email: string;
				oauth: string;
				roles: string;
				companyRef: string;
			};
		};
	};
};

export type NSignUpApiResponseType = {
	message: string;
	data: {
		user: {
			name: {
				first: string;
				last: string;
			};
			email: string;
			oauth: string;
			roles: string;
			companyRef: string;
		};
	};
};

// -----
// Enums
// -----
export enum ROLES {
	SUPER_ADMIN = "SUPER_ADMIN",
	ADMIN = "ADMIN",
	USER = "USER",
	SYSTEM = "SYSTEM",
	TECHNICIAN_EMPLOYEE = "EMPLOYEE",
	SUB_CONTRACTOR = "SUB_CONTRACTOR",
	SUB_CONTRACTOR_CREW_LEADER = "SUB_CONTRACTOR_CREW_LEADER",
}

export enum STATUS {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
}

export enum INVITED_USER_STATUS {
	PENDING = "PENDING",
	ACCEPTED = "ACCEPTED",
	CANCELED = "CANCELED",
}

export enum SidebarTitle {
	Notifications = "Notifications",
	Dashboard = "Dashboard",
	Settings = "Settings",
	Reports = "Reports",
	Users = "Users",
}

export enum COOKIES {
	TOKEN = "token", // this is set from backend and its mainly used for authentication.
	USER_TYPE = "userType",
	COMPANY_REF = "companyRef",
	IS_ADMIN_PATH = "isAdminPath",
	AUTH_TOKEN = "authToken",
	NEXT_LOCALE = "NEXT_LOCALE",
	EMULATED_ROLE_ID = "emulatedRoleId",
}

// SIDEBAR TYPES
export type SidebarSubItem = {
	key?: string;
	title: string;
	url: string;
	icon: IconType;
	badgeCount?: number;
	newTab?: boolean;
	moduleKey?: MODULE;
};

export type SidebarGroup = {
	key?: string;
	title: string;
	icon: IconType;
	items: SidebarSubItem[];
};

export type SidebarItem = SidebarSubItem | SidebarGroup;

export type IApiResponse<T> = {
	data: T;
	message: string;
	success: boolean;
};

export type IPaginatedApiResponse<T> = {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
};

export interface IOpenModal {
	modalTitle?: React.ReactNode;
	modalView: React.ReactNode;
	subHeader?: React.ReactNode;
	footer?: React.ReactNode;
	variant?: keyof typeof modalBodyVariants;
	showDefaultClose?: boolean;
	closeOnOutsideClick?: boolean;
}

export interface IUseModalResult {
	openModal: ({}: IOpenModal) => void;
	closeModal: () => void;
	Modal: React.FC;
}

export interface IOpenDropdown {
	dropdownView: React.ReactNode;
}

export interface IUseDropdownResult {
	openDropdown: (options: IOpenDropdown) => void;
	closeDropdown: () => void;
	Dropdown: React.FC;
}

export interface IPaginatedQuery {
	page?: number;
	pageSize?: number;
	searchValue?: string;
	sortBy?: string;
	sortOrder?: SORT_ORDER;
}

export interface IApiSuccessResponse<T> {
	success: boolean;
	data: T;
}

export interface IProfileModalProps {
	onClose: () => void;
}
