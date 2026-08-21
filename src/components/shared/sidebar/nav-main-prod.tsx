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
	type NestedSidebarGroup as SidebarGroupType,
	type NestedSidebarItem as SidebarItem,
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
				className={`group/submenu h-auto min-h-10 rounded-[10px] p-[10px] text-brand-dark transition-colors ${isActive ? "bg-brand-dark text-white hover:bg-brand-dark hover:text-white [&>svg]:text-white" : ""}`}
			>
				<a
					href={item.url}
					target={item.newTab ? "_blank" : "_self"}
					className="flex w-full items-center justify-between gap-2 px-2 py-2"
				>
					<div className="flex min-w-0 items-center gap-2.5">
						<item.icon className="h-5 w-5 shrink-0 transition-colors" />
						<span className="whitespace-normal break-words text-sm leading-snug">{item.title}</span>
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

const containsActivePath = (item: SidebarItem, path: string): boolean =>
	isSidebarGroup(item)
		? item.items.some((sub) => containsActivePath(sub, path))
		: item.url === path || path.includes(item.url);

const NavSubGroup = ({ group }: { group: SidebarGroupType }) => {
	const pathName = usePathname();
	const defaultOpen = group.items.some((sub) => containsActivePath(sub, pathName));

	return (
		<SidebarMenuSubItem>
			<Collapsible className="group/subcollapsible w-full" defaultOpen={defaultOpen}>
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex h-auto min-h-10 w-full items-center justify-between gap-2 rounded-[10px] p-[10px] text-left text-brand-dark transition-colors hover:bg-gray-50 data-[state=open]:bg-gray-50"
					>
						<span className="flex min-w-0 items-center gap-2.5">
							<group.icon className="h-4 w-4 shrink-0" />
							<span className="whitespace-normal break-words text-sm font-medium leading-snug">{group.title}</span>
						</span>
						<ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]/subcollapsible:rotate-180" />
					</button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub className="mt-1 space-y-1">
						{group.items.map((sub) =>
							isSidebarGroup(sub) ? <NavSubGroup key={sub.title} group={sub} /> : <NavItem key={sub.title} item={sub} />
						)}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuSubItem>
	);
};

const NavMain = ({ items }: NavMainProps) => {
	const pathName = usePathname();
	const isGroupOpen = (item: SidebarGroupType) => {
		return item.items.some((subItem) => containsActivePath(subItem, pathName));
	};
	const { toggleSidebar } = useSidebar();

	return (
		<Sidebar className="space-y-2">
			<div className="px-5 py-6">
				<div className="flex items-center gap-4">
					<SidebarToggleButton onClick={toggleSidebar} />
					<div className="relative h-[46px] w-[162px]">
						{/* <Image src="/assets/svg/bcew-logo.svg" alt="bcew-logo" fill className="object-contain" priority /> */}
					</div>
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
												<SidebarMenuButton className="group h-auto min-h-10 w-full justify-between gap-2 rounded-[10px] p-[10px] text-left text-sm font-normal text-brand-dark transition-colors data-[state=open]:bg-gray-50">
													<div className="flex min-w-0 items-center gap-2.5">
														<item.icon className="h-4 w-4 shrink-0" />
														<span className="whitespace-normal break-words text-sm font-medium leading-snug">
															{item.title}
														</span>
													</div>
													<ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" />
												</SidebarMenuButton>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<SidebarMenuSub className="ml-2 mt-1 space-y-1">
													{item.items.map((subItem) =>
														isSidebarGroup(subItem) ? (
															<NavSubGroup key={subItem.title} group={subItem} />
														) : (
															<NavItem key={subItem.title} item={subItem} />
														)
													)}
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
