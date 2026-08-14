"use client";
import NavMainProd from "@/components/shared/sidebar/nav-main-prod";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils/utils";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { useScheduleParams } from "@/module/schedule-management/weekly-schedule-management/hooks/useScheduleParams";
import useAuthStore from "@/store/auth-store";
import { NestedSidebarItem, ROLES } from "@/types";
import { MODULE } from "@/utils/enums";

const filterSidebarItems = (items: NestedSidebarItem[], modules: Record<MODULE, ACCESS_LEVEL>): NestedSidebarItem[] => {
	return items
		.map((item) => {
			if (!("items" in item)) {
				if (!item.moduleKey) return item;
				if (modules[item.moduleKey]) return item;
				return null;
			}

			// Recurse so nested sub-groups are filtered too, and an empty group drops out.
			const filteredChildren = filterSidebarItems(item.items, modules);

			if (filteredChildren.length === 0) return null;

			return { ...item, items: filteredChildren };
		})
		.filter(Boolean) as NestedSidebarItem[];
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
	items: NestedSidebarItem[];
};

const AppSidebar = ({ items, ...props }: AppSidebarProps) => {
	const { open } = useSidebar();
	const { user } = useAuthStore((state) => state);
	const { getParams } = useScheduleParams();
	const { pdf } = getParams();

	const permittedItems =
		user?.userType === ROLES.SUB_CONTRACTOR ? items : user?.modules ? filterSidebarItems(items, user.modules) : items;

	if (pdf) {
		return null;
	}

	return (
		<div
			className={cn(
				"hidden overflow-hidden transition-[width] duration-300 ease-in-out",
				// Only reserve sidebar space on true desktop (≥1024 px).
				// On mobile/tablet/landscape the Sidebar renders as a Sheet overlay
				// so the outer wrapper must stay hidden to keep content full-width.
				open ? "lg:flex lg:w-[--sidebar-width]" : "lg:block lg:w-0"
			)}
		>
			<Sidebar collapsible="icon" {...props}>
				<SidebarContent className="no-scrollbar">
					<NavMainProd items={permittedItems} />
				</SidebarContent>
			</Sidebar>
		</div>
	);
};

export default AppSidebar;
