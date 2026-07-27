"use client";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/shared/sidebar/app-sidebar";
import { useSubContractorAdminDesktopMenus } from "@/module/admin/components/sub-contractor-desktop-menus";
import SectionWrapper from "@/components/shared/section-wrapper";
import { AdminNotificationProvider } from "@/module/admin/context/admin-notification";
import AppSidebarProd from "@/components/shared/sidebar/app-sidebar-prod";
import { isProductionEnv } from "@/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const SubContractorAdminDesktopMenus = useSubContractorAdminDesktopMenus();
	const isProd = isProductionEnv();
	return (
		<AdminNotificationProvider>
			<SidebarProvider className="h-screen overflow-hidden">
				<div className="page-shell flex h-full w-full overflow-hidden">
					{isProd ? (
						<AppSidebarProd items={SubContractorAdminDesktopMenus} />
					) : (
						<AppSidebar items={SubContractorAdminDesktopMenus} />
					)}
					<SectionWrapper>{children}</SectionWrapper>
				</div>
			</SidebarProvider>
		</AdminNotificationProvider>
	);
}
