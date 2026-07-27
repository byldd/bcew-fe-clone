"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import useAuthStore from "@/store/auth-store";
import {
	ROLES,
	SidebarTitle,
	type SidebarGroup as SidebarGroupType,
	type SidebarItem,
	type SidebarSubItem,
} from "@/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SidebarToggleButton from "./sidebar-toggle-button";
import { useAdminNotification } from "@/module/admin/context/admin-notification";

import { dateToUTCString, getTodayDate } from "@/lib/utils/date";
import { useSubContractorUnreadNotificationCount } from "@/module/sub-contractor/notification/hooks/useSubContractorNotification";
import AdminSidebarFooter from "@/module/admin/components/sidebar-footer";

type NavMainProps = {
	items: SidebarItem[];
};

function isSidebarGroup(item: SidebarItem): item is SidebarGroupType {
	return "items" in item;
}

const NavItem = ({ item }: { item: SidebarSubItem }) => {
	const pathName = usePathname();
	const isActive = pathName === item.url || pathName.includes(item.url);

	const isNotification = item.title === SidebarTitle.Notifications;

	const { user } = useAuthStore((store) => store);

	const isSubContractor = user?.userType === ROLES.SUB_CONTRACTOR;

	const { data: subContractorCount = 0 } = useSubContractorUnreadNotificationCount(
		dateToUTCString(getTodayDate()),
		isSubContractor
	);

	const { notificationCount: adminCount = 0 } = useAdminNotification();

	const notificationCount = isSubContractor ? subContractorCount : adminCount;

	return (
		<SidebarMenuSubItem key={item.title}>
			<SidebarMenuSubButton
				asChild
				className={`group/submenu h-10 rounded-[10px] p-[10px] text-brand-dark transition-colors ${isActive ? "bg-brand-dark text-white hover:bg-brand-dark hover:text-white [&>svg]:text-white" : ""}`}
			>
				<a
					href={item.url}
					target={item.newTab ? "_blank" : "_self"}
					className="flex w-full items-center justify-between px-3 py-2"
				>
					<div className="flex items-center gap-3">
						<item.icon className="h-5 w-5 transition-colors" />
						<span className="text-sm">{item.title}</span>
					</div>
					{isNotification && notificationCount > 0 && (
						<span className="flex h-5 w-9 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
							{notificationCount}
						</span>
					)}
				</a>
			</SidebarMenuSubButton>{" "}
		</SidebarMenuSubItem>
	);
};

const NavMain = ({ items }: NavMainProps) => {
	const pathName = usePathname();
	const isGroupOpen = (item: SidebarGroupType) => {
		return item.items.some((subItem) => subItem.url === pathName);
	};
	const { toggleSidebar } = useSidebar();

	return (
		<Sidebar className="space-y-2">
			<div className="px-5 py-6">
				<div className="flex items-center gap-4">
					<SidebarToggleButton onClick={toggleSidebar} />
					<div className="relative h-[46px] w-[162px]"></div>
				</div>
			</div>

			<SidebarContent className="py-4 pl-5 pr-8">
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1">
							{items.map((item) =>
								isSidebarGroup(item) ? (
									// === GROUP CASE ===
									<SidebarMenuItem key={item.title}>
										<Collapsible className="group/collapsible" defaultOpen={isGroupOpen(item)}>
											<CollapsibleTrigger asChild>
												<SidebarMenuButton className="group h-10 w-full justify-between rounded-[10px] p-[10px] text-sm font-normal text-brand-dark transition-colors data-[state=open]:bg-gray-50">
													<div className="flex items-center gap-3">
														<item.icon className="h-4 w-4" />
														<span className="text-sm font-medium">{item.title}</span>
													</div>
													<ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
												</SidebarMenuButton>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<SidebarMenuSub className="ml-6 mt-1 space-y-1">
													{item.items.map((subItem) => (
														<NavItem key={subItem.title} item={subItem} />
													))}
												</SidebarMenuSub>
											</CollapsibleContent>
										</Collapsible>
									</SidebarMenuItem>
								) : (
									// === SIMPLE MENU ITEM ===
									<NavItem key={item.title} item={item} />
								)
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<AdminSidebarFooter />
		</Sidebar>
	);
};

export default NavMain;
