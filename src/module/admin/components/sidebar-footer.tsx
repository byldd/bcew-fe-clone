"use client";

import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import ProfileModal from "@/components/common/profile-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES } from "@/types";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import useAuthStore from "@/store/auth-store";
import { useModal } from "@/hooks/useModal";
import { routes } from "@/config/routes";
import { clearCookies } from "@/module/auth/utils/helpers";
import SmsConsent from "@/components/shared/sms-consent";
import EmulationMenuItem from "@/module/auth/components/emulation-menu-item";

const AdminSidebarFooter = () => {
	const { Modal, openModal, closeModal } = useModal();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const router = useRouter();

	const { user } = useAuthStore((store) => store);
	// While impersonating another user, `user.name`/`user.role` reflect the
	// impersonated person — the sidebar footer should keep showing the real
	// admin (held on `impersonatedByUser`), not whoever is being viewed as.
	const displayName = user?.impersonatedByUser?.name ?? user?.name;
	const displayRole = user?.impersonatedByUser?.role?.name ?? user?.role?.name;

	const handleSignOut = () => {
		clearCookies();
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
	return (
		<SidebarFooter className="p-3">
			<Modal />
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton className="group w-full justify-between transition-colors">
								<div className="flex items-center gap-3">
									<Avatar className="h-8 w-8">
										<AvatarImage src="/placeholder.svg?height=32&width=32" />
										<AvatarFallback className="bg-gray-200 text-brand-dark">{displayName?.charAt(0)}</AvatarFallback>
									</Avatar>
									<div className="flex flex-col items-start">
										<span className="text-sm font-medium text-brand-dark">{displayName}</span>
										<span className="text-xs text-brand-dark">{displayRole}</span>
									</div>
								</div>
								<ChevronDown className="h-4 w-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem onClick={handleProfileClick}>
								<span>{tCommon.profile}</span>
							</DropdownMenuItem>

							<EmulationMenuItem />

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
	);
};

export default AdminSidebarFooter;
