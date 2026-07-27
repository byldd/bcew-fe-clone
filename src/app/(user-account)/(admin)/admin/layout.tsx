"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import SectionWrapper from "@/components/shared/section-wrapper";
import { AdminNotificationProvider } from "@/module/admin/context/admin-notification";
import { isProductionEnv } from "@/utils";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/utils";
import AdminSidebBar from "@/module/admin/components/admin-side-bar";
import { useGetPageAccess, useGetPageEndpoint } from "@/module/admin/hooks/useSidebar";
import { Spinner } from "@/components/ui/spinner";
import { AdminSidebBarProvider } from "@/module/admin/context/page-access";
import AppSidebarProd from "@/components/shared/sidebar/app-sidebar-prod";
import { useAdminMenuProd } from "@/module/admin/components/menu-prod";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const hideSidebar = pathname?.includes(routes.admin.jobLevelPullList);
	const adminMenusProd = useAdminMenuProd();
	const isProd = isProductionEnv();

	const isLegacy = pathname?.includes(routes.admin.legacy);

	const urlEndpoint = useGetPageEndpoint();

	const { data: pageAccess, isLoading } = useGetPageAccess({ urlEndpoint });

	return (
		<AdminNotificationProvider>
			<AdminSidebBarProvider pageAccess={pageAccess}>
				<SidebarProvider>
					<div className="page-shell flex min-h-full w-full overflow-hidden">
						{!hideSidebar ? isProd ? <AppSidebarProd items={adminMenusProd} /> : <AdminSidebBar /> : null}
						<SectionWrapper className={cn("overflow-y-auto", isLegacy && "px-1 py-0")}>
							{isProductionEnv() ? (
								<>{children}</>
							) : (
								<>
									{isLoading ? (
										<div className="flex h-screen w-full items-center justify-center">
											<Spinner />
										</div>
									) : !pageAccess?.accessLevel ? (
										<div className="flex h-screen w-full items-center justify-center text-red-500">
											You do not have access to this page
										</div>
									) : (
										children
									)}
								</>
							)}
						</SectionWrapper>
					</div>
				</SidebarProvider>
			</AdminSidebBarProvider>
		</AdminNotificationProvider>
	);
}
