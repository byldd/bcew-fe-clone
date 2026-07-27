"use client";
import Image from "next/image";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	useSidebar,
} from "@/components/ui/sidebar";
import SidebarToggleButton from "@/components/shared/sidebar/sidebar-toggle-button";
import { cn } from "@/lib/utils/utils";
import { useScheduleParams } from "@/module/schedule-management/weekly-schedule-management/hooks/useScheduleParams";
import { useGetSideBarPages, useUpdateSidebarOrder } from "../hooks/useSidebar";
import AdminSidebarNavItem from "./admin-sidebar-nav-item";
import AdminSidebarFooter from "./sidebar-footer";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { ISidebarPageNode } from "../types/sideb-bar-page";
import { openErrorToast } from "@/components/toast";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableSidebarItem from "./sortable-sideber-item";

const AdminSidebBar = () => {
	const { data: pages, refetch } = useGetSideBarPages();
	const { open, toggleSidebar } = useSidebar();
	const { getParams } = useScheduleParams();
	const { pdf } = getParams();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

	const [sidebarPages, setSidebarPages] = useState<ISidebarPageNode[]>([]);
	const { mutate: updateSidebarOrder } = useUpdateSidebarOrder();

	useEffect(() => {
		if (pages) {
			setSidebarPages(pages);
		}
	}, [pages]);

	const saveOrder = async (pages: ISidebarPageNode[]) => {
		const payload = pages.map((page, index) => ({
			pageId: page.id,
			sortOrder: index + 1,
		}));

		updateSidebarOrder(payload, {
			onSuccess: () => {
				refetch();
			},
			onError(error) {
				openErrorToast({ error });
			},
		});
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		setSidebarPages((current) => {
			const oldIndex = current.findIndex((item) => item.id === active.id);

			const newIndex = current.findIndex((item) => item.id === over.id);

			const updated = arrayMove(current, oldIndex, newIndex);

			saveOrder(updated);

			return updated;
		});
	};

	if (pdf) {
		return null;
	}

	return (
		<div
			className={cn(
				"hidden overflow-hidden transition-[width] duration-300 ease-in-out",
				open ? "lg:flex lg:w-[--sidebar-width]" : "lg:block lg:w-0"
			)}
		>
			<Sidebar collapsible="offcanvas">
				<div className="px-5 py-6">
					<div className="flex items-center gap-4">
						<SidebarToggleButton onClick={toggleSidebar} />
						<div className="relative h-[46px] w-[162px]"></div>
					</div>
				</div>

				<SidebarContent className="no-scrollbar py-4 pl-5 pr-8">
					<SidebarGroup className="p-0">
						<SidebarGroupContent>
							<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
								<SortableContext items={sidebarPages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
									<SidebarMenu className="space-y-1">
										{sidebarPages.map((node) => (
											<SortableSidebarItem key={node.id} id={node.id}>
												<AdminSidebarNavItem node={node} />
											</SortableSidebarItem>
										))}
									</SidebarMenu>
								</SortableContext>
							</DndContext>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<AdminSidebarFooter />
			</Sidebar>
		</div>
	);
};

export default AdminSidebBar;
