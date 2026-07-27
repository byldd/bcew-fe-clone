"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, File, Folder } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils/utils";
import { hasActiveDescendant, isPageActive } from "../utils/sidebar-page-tree";
import { E_APPLICATION, E_APPLICATION_BASE_URL, ISidebarPageNode, SIDEBAR_PAGE_KEY } from "../types/sideb-bar-page";
import Image from "next/image";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";
import { useGetAdminNotificationsCount } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
type AdminSidebarNavItemProps = {
	node: ISidebarPageNode;
	depth?: number;
};

const AdminSidebarNavItem = ({ node, depth = 0 }: AdminSidebarNavItemProps) => {
	const pathName = usePathname();
	const hasChildren = node.children.length > 0;
	const isActive = isPageActive(node.urlEndpoint, pathName);
	const Icon = hasChildren ? Folder : File;

	const { user } = useAuthStore((user) => user);
	const { data: notificationData } = useGetAdminNotificationsCount(user?.userType === ROLES.ADMIN);

	const notificationCount = notificationData?.count || 0;
	const labelClassName = cn("text-sm", depth === 0 && "font-medium");
	const isNotification = node.key === SIDEBAR_PAGE_KEY.NOTIFICATION;

	if (!hasChildren) {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton
					asChild
					className={cn(
						"group h-10 w-full justify-between rounded-[10px] p-[10px] text-sm font-normal text-brand-dark transition-colors",
						isActive
							? "bg-brand-dark text-white hover:bg-brand-dark hover:text-white [&>svg]:text-white"
							: "hover:bg-gray-50"
					)}
				>
					<Link
						href={
							node.application != E_APPLICATION.BYLDD
								? `${E_APPLICATION_BASE_URL[node.application]}${node.urlEndpoint}`
								: node?.urlEndpoint || "#"
						}
						className="flex w-full items-center justify-between"
						target={node.application != E_APPLICATION.BYLDD ? "_blank" : "_self"}
					>
						<div className="flex items-center gap-3">
							{node?.iconUrl ? (
								<Image
									unoptimized
									src={node.iconUrl}
									alt={node.name}
									className={cn("h-5 w-5", isActive && "brightness-0 invert")}
									width={16}
									height={16}
								/>
							) : (
								<Icon className="h-4 w-4" />
							)}
							<span className={labelClassName}>{node.name}</span>

							{isNotification && notificationCount > 0 && (
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
									{notificationCount}
								</span>
							)}
						</div>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	return (
		<SidebarMenuItem>
			<Collapsible className="group/collapsible" defaultOpen={hasActiveDescendant(node, pathName)}>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton className="group h-10 w-full justify-between rounded-[10px] p-[10px] text-sm font-normal text-brand-dark transition-colors data-[state=open]:bg-gray-50">
						<div className="flex cursor-grab items-center gap-3 active:cursor-grabbing">
							{node?.iconUrl ? (
								<Image unoptimized src={node.iconUrl} alt={node.name} className="h-4 w-4" width={16} height={16} />
							) : (
								<Icon className="h-4 w-4" />
							)}
							<span className={labelClassName}>{node.name}</span>
						</div>
						<ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub className="ml-6 mt-1 space-y-1">
						{node.children.map((child) => (
							<AdminSidebarNavItem key={child.id} node={child} depth={depth + 1} />
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	);
};

export default AdminSidebarNavItem;
