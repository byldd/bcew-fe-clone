"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
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

import ProfileModal from "@/components/common/profile-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/routes";
import { useModal } from "@/hooks/useModal";
import { clearCookies } from "@/module/auth/utils/helpers";
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
import { usePathname, useRouter } from "next/navigation";
import SidebarToggleButton from "./sidebar-toggle-button";
import { useAdminNotification } from "@/module/admin/context/admin-notification";
import SmsConsent from "../sms-consent";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { dateToUTCString, getTodayDate } from "@/lib/utils/date";
import { useSubContractorUnreadNotificationCount } from "@/module/sub-contractor/notification/hooks/useSubContractorNotification";
import {
	DndContext,
	PointerSensor,
	closestCenter,
	type DragEndEvent,
	type DraggableAttributes,
	useSensor,
	useSensors,
} from "@dnd-kit/core";

import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, type ReactNode } from "react";
import { useUpdateNavOrder } from "@/hooks/useNavReorder";
import { getNavItemKey } from "./utils/nav-main";
import { FIXED_KEYS } from "./enum";
import { SidebarItemBadge } from "@/components/ui/sidebar-item-badge";
import Link from "next/link";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";

type NavMainProps = {
	items: SidebarItem[];
};

function isSidebarGroup(item: SidebarItem): item is SidebarGroupType {
	return "items" in item;
}

type SortableItemProps = {
	id: string;
	disabled?: boolean;
	children: (props: {
		attributes: Partial<DraggableAttributes>;
		listeners: ReturnType<typeof useSortable>["listeners"];
	}) => ReactNode;
};

const ActiveSortableItem = ({ id, disabled, children }: SortableItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id,
		disabled,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style}>
			{children({ attributes, listeners })}
		</div>
	);
};

export const SortableItem = ({ id, disabled, children }: SortableItemProps) => {
	if (disabled) {
		return <div>{children({ attributes: {}, listeners: undefined })}</div>;
	}

	return (
		<ActiveSortableItem id={id} disabled={disabled}>
			{children}
		</ActiveSortableItem>
	);
};

const isNotificationItem = (item: Pick<SidebarSubItem, "key" | "title">) => {
	return item.key === FIXED_KEYS.NOTIFICATIONS || item.title === SidebarTitle.Notifications;
};

const NavItem = ({ item }: { item: SidebarSubItem }) => {
	const pathName = usePathname();

	const isActive = pathName === item.url || pathName.startsWith(item.url + "/");

	const { user } = useAuthStore((store) => store);

	const isSubContractor = user?.userType === ROLES.SUB_CONTRACTOR;

	const { data: subContractorCount = 0 } = useSubContractorUnreadNotificationCount(
		dateToUTCString(getTodayDate()),
		isSubContractor
	);

	const { notificationCount: adminCount = 0 } = useAdminNotification();

	const unreadNotificationCount = isSubContractor ? subContractorCount : adminCount;
	const badgeCount = isNotificationItem(item) ? unreadNotificationCount : item.badgeCount || 0;

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
						<span className={`flex h-4 w-4 transition-all ${isActive ? "brightness-0 invert" : ""}`}>
							<item.icon className="h-4 w-4" />
						</span>
						<span className="text-sm">{item.title}</span>
					</div>
					<SidebarItemBadge count={badgeCount} />
				</a>
			</SidebarMenuSubButton>{" "}
		</SidebarMenuSubItem>
	);
};

const NavMain = ({ items }: NavMainProps) => {
	const { Modal, openModal, closeModal } = useModal();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const pathName = usePathname();
	const isGroupOpen = (item: SidebarGroupType) => {
		return item.items.some((subItem) => pathName === subItem.url || pathName.startsWith(subItem.url + "/"));
	};
	const router = useRouter();
	const { toggleSidebar } = useSidebar();
	const { user } = useAuthStore((state) => state);
	const TOP_FIXED_KEYS: string[] = [FIXED_KEYS.NOTIFICATIONS, FIXED_KEYS.DASHBOARD];
	const BOTTOM_FIXED_KEYS: string[] = [FIXED_KEYS.SETTINGS];
	const [navItems, setNavItems] = useState(items);
	const { mutate: updateNavOrder } = useUpdateNavOrder();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
	const isSubContractorRole =
		user?.userType === ROLES.SUB_CONTRACTOR || user?.userType === ROLES.SUB_CONTRACTOR_CREW_LEADER;
	const isNavReorderEnabled = !isSubContractorRole;
	const { useSignout } = useAuthAPI();
	const { signout } = useSignout();

	useEffect(() => {
		setNavItems(items);
	}, [items]);

	const handleDragEnd = (event: DragEndEvent) => {
		if (!isNavReorderEnabled) return;

		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const activeId = String(active.id);
		const overId = String(over.id);

		if (TOP_FIXED_KEYS.includes(activeId) || BOTTOM_FIXED_KEYS.includes(activeId)) {
			return;
		}

		if (TOP_FIXED_KEYS.includes(overId) || BOTTOM_FIXED_KEYS.includes(overId)) {
			return;
		}

		const oldIndex = navItems.findIndex((i) => getNavItemKey(i) === activeId);
		const newIndex = navItems.findIndex((i) => getNavItemKey(i) === overId);

		const newItems = arrayMove(navItems, oldIndex, newIndex);

		const topFixed = items.filter((i) => TOP_FIXED_KEYS.includes(getNavItemKey(i)));

		const bottomFixed = items.filter((i) => BOTTOM_FIXED_KEYS.includes(getNavItemKey(i)));

		const dynamic = newItems.filter(
			(i) => !TOP_FIXED_KEYS.includes(getNavItemKey(i)) && !BOTTOM_FIXED_KEYS.includes(getNavItemKey(i))
		);

		const finalItems = [...topFixed, ...dynamic, ...bottomFixed];

		setNavItems(finalItems);

		const order = dynamic.map((i) => getNavItemKey(i));

		updateNavOrder(order, {
			// if we need in future
			// onSuccess: () => openSuccessToast("Nav order saved"),
			onError: () => console.error("Failed to save nav order"),
		});
	};

	const handleSignOut = () => {
		signout();
		router.replace(routes.signIn);
	};

	const handleProfileClick = () => {
		openModal({
			modalTitle: tCommon.myProfile,
			modalView: <ProfileModal onClose={closeModal} />,
		});
	};

	const handleSwitchToTechnicianPortal = () => {
		router.push(routes.employee.dashboard);
	};

	const handleTechnicalIssuesClick = () => {
		if (user?.userType === ROLES.SUB_CONTRACTOR) {
			router.push(routes.subContractorAdminDesktop.technicalIssues);
			return;
		}

		router.push(routes.admin.technicalIssues);
	};

	const handleSwitchToMobileView = () => {
		router.push(routes.subContractor.adminDashboard);
	};

	const handleReleaseNotes = () => {
		router.push(routes.admin.releaseNotes);
	};

	const handleSmsConsentClick = () => {
		openModal({
			modalView: <SmsConsent onClose={closeModal} />,
			variant: "medium",
		});
	};

	const isSubContractor = user?.userType === ROLES.SUB_CONTRACTOR;
	const { data: subContractorCount = 0 } = useSubContractorUnreadNotificationCount(
		dateToUTCString(getTodayDate()),
		isSubContractor
	);
	const { notificationCount: adminCount = 0 } = useAdminNotification();
	const unreadNotificationCount = isSubContractor ? subContractorCount : adminCount;

	return (
		<Sidebar className="space-y-2">
			<div className="px-5 py-6">
				<div className="flex items-center gap-4">
					<SidebarToggleButton onClick={toggleSidebar} />
					<div className="relative h-[46px] w-[162px]">
						<Image src="/assets/svg/bcew-logo.svg" alt="bcew-logo" fill className="object-contain" priority />
					</div>
				</div>
			</div>

			<SidebarContent className="py-4 pl-5 pr-8">
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1">
							<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
								<SortableContext items={navItems.map((i) => getNavItemKey(i))} strategy={verticalListSortingStrategy}>
									{navItems.map((item) => {
										const itemKey = getNavItemKey(item);
										const isFixed = TOP_FIXED_KEYS.includes(itemKey) || BOTTOM_FIXED_KEYS.includes(itemKey);
										const isDragDisabled = isFixed || !isNavReorderEnabled;

										return (
											<SortableItem key={itemKey} id={itemKey} disabled={isDragDisabled}>
												{({ attributes, listeners }) =>
													isSidebarGroup(item) ? (
														// === GROUP CASE ===
														<SidebarMenuItem>
															<Collapsible className="group/collapsible" defaultOpen={isGroupOpen(item)}>
																<CollapsibleTrigger asChild>
																	<SidebarMenuButton className="group h-10 w-full justify-between rounded-[10px] p-[10px] text-sm font-normal text-brand-dark transition-colors data-[state=open]:bg-gray-50">
																		{/* DRAG HERE */}
																		<div
																			{...(!isDragDisabled ? { ...attributes, ...listeners } : {})}
																			className={`flex items-center gap-3 ${
																				isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
																			}`}
																		>
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
														// === SIMPLE ITEM ===

														<SidebarMenuItem>
															<SidebarMenuButton
																asChild
																className={`group h-10 w-full rounded-[10px] p-[10px] text-sm font-normal text-brand-dark transition-colors ${
																	pathName === item.url || pathName.startsWith(item.url + "/")
																		? "bg-brand-dark text-white hover:bg-brand-dark hover:text-white"
																		: "hover:bg-gray-50"
																}`}
															>
																<Link href={item.url} className="flex w-full items-center justify-between">
																	<div
																		{...(!isDragDisabled ? { ...attributes, ...listeners } : {})}
																		className={`flex items-center gap-3 ${
																			isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
																		}`}
																	>
																		<span
																			className={`flex h-4 w-4 transition-all ${
																				pathName === item.url || pathName.startsWith(item.url + "/")
																					? "brightness-0 invert"
																					: ""
																			}`}
																		>
																			<item.icon className="h-4 w-4" />
																		</span>

																		<span className="text-sm font-medium">{item.title}</span>
																	</div>

																	<SidebarItemBadge
																		count={isNotificationItem(item) ? unreadNotificationCount : item.badgeCount || 0}
																	/>
																</Link>
															</SidebarMenuButton>
														</SidebarMenuItem>
													)
												}
											</SortableItem>
										);
									})}
								</SortableContext>
							</DndContext>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									onPointerDown={(e) => e.stopPropagation()}
									onPointerUp={(e) => e.stopPropagation()}
									onClick={(e) => e.stopPropagation()}
									className="group w-full justify-between transition-colors"
								>
									<div className="flex items-center gap-3">
										<Avatar className="h-8 w-8">
											<AvatarImage src="/placeholder.svg?height=32&width=32" />
											<AvatarFallback className="bg-gray-200 text-brand-dark">{user?.name?.charAt(0)}</AvatarFallback>
										</Avatar>
										<div className="flex flex-col items-start">
											<span className="text-sm font-medium text-brand-dark">
												{user?.impersonatedByUser ? user?.impersonatedByUser?.name : user?.name}
											</span>
											<span className="text-xs text-brand-dark">
												{user?.impersonatedByUser ? user?.impersonatedByUser?.role?.name : user?.role?.name}
											</span>
										</div>
									</div>
									<ChevronDown className="h-4 w-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem onClick={handleProfileClick}>
									<span>{tCommon.profile}</span>
								</DropdownMenuItem>

								{user?.userType !== ROLES?.SUB_CONTRACTOR && (
									<DropdownMenuItem onClick={handleSwitchToTechnicianPortal}>
										<span>{tCommon.switchToTechnicianPortal}</span>
									</DropdownMenuItem>
								)}

								{user?.userType === ROLES?.SUB_CONTRACTOR && (
									<DropdownMenuItem onClick={handleSwitchToMobileView}>
										<span>{tCommon.switchToMobileView}</span>
									</DropdownMenuItem>
								)}

								<DropdownMenuItem onClick={handleSmsConsentClick}>
									<span>{tCommon.smsConsent}</span>
								</DropdownMenuItem>

								{user?.userType !== ROLES?.SUB_CONTRACTOR && (
									<DropdownMenuItem onClick={handleReleaseNotes}>
										<span>{tCommon.releaseNotes}</span>
									</DropdownMenuItem>
								)}

								<DropdownMenuItem onClick={handleTechnicalIssuesClick}>
									<span>{tCommon.technicalIssues}</span>
								</DropdownMenuItem>

								<DropdownMenuItem>
									<span>{tCommon.accountSettings}</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleSignOut}>
									<span>{tCommon.signOut}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<Modal />
		</Sidebar>
	);
};

export default NavMain;
