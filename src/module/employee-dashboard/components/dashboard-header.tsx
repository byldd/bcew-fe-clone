"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { LegendContent } from "@/module/employee-dashboard/components/legend-modal-content";
import React, { useState } from "react";
import { HeaderButton } from "@/module/employee-dashboard/types";
import { useModal } from "@/hooks/useModal";

import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ProfileModal from "@/components/common/profile-modal";
import useAuthStore from "@/store/auth-store";
import ReportTechnicalIssue from "../../employee-technical-issue/report-technical-bug/components/report-technical-issue";

import SmsConsent from "@/components/shared/sms-consent";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import UnreadNotificationCount from "./unread-notification-count";
import { E_ROLES, TEAM_NAME } from "@/utils/enums";
import QuickToolsDrawer from "./quick-tools-drawer";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";

export function DashboardHeader({
	isTimeLogPending,
	setSelfScheduleOpen,
}: {
	isTimeLogPending: boolean | undefined;
	setSelfScheduleOpen?: (open: boolean) => void;
}) {
	const { user } = useAuthStore((state) => state);
	const router = useRouter();
	const { Modal, openModal, closeModal } = useModal();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tTechnician = useTypedTranslations(NAMESPACE.RELEASE_NOTE);
	const [quickToolsOpen, setQuickToolsOpen] = useState(false);
	const { useSignout } = useAuthAPI();
	const { signout } = useSignout();

	const defaultButtons: HeaderButton[] = [
		...[
			...(user?.isWeekendSelfSchedulingAllowed
				? [
						{
							key: "add-schedule",
							icon: <Image src="/assets/svg/plus.svg" alt="Add Schedule" height={24} width={24} />,
							onClick: () => router.push(routes.employee.selfScheduling),
							variant: "filled",
							className: "bg-brand-dark text-white h-8 w-8",
							ariaLabel: "Add schedule",
						} as HeaderButton,
					]
				: []),
		],

		{
			key: "legend",
			icon: <Image src="/assets/svg/info.svg" alt="Legend" height={24} width={24} />,

			onClick: () =>
				openModal({
					modalTitle: "Legends",
					modalView: <LegendContent />,
				}),
			variant: "secondary",

			ariaLabel: "Show legend",
		},
		{
			key: "edit-vehicle",
			icon: <Image src="/assets/svg/vehicle.svg" alt="Legend" height={24} width={24} />,
			onClick: () => router.push(routes.employee.vehicleHistory),
			variant: "filled",
			className: "bg-brand-dark text-white text-xs font-medium h-6  py-1 ",
		},
		{
			key: "attendance",
			icon: <Image src="/assets/svg/calender.svg" alt="calender" height={24} width={24} />,
			onClick: () => window.open(routes.bcew.requestForTimeoff, "_blank"),
			variant: "filled",
			className: "bg-brand-dark text-white text-xs font-medium h-6  py-1 ",
		},

		{
			key: "notification",
			icon: (
				<div className="relative">
					<Image src="/assets/svg/bell.svg" alt="Notification" height={24} width={24} />

					<UnreadNotificationCount />
				</div>
			),
			onClick: () => router.push(routes.employee.notification),
			variant: "filled",
			className: "bg-brand-dark text-white text-xs font-medium h-6 py-1",
		},
	];

	const handleSignOut = () => {
		signout();
		router.replace(routes.signIn);
	};

	const handleProfileClick = () => {
		if (!user) return;
		openModal({
			modalTitle: tCommon.myProfile,
			modalView: <ProfileModal onClose={closeModal} />,
		});
	};

	const handleSmsConsentClick = () => {
		openModal({
			modalView: <SmsConsent onClose={closeModal} />,
		});
	};

	const handleSwitchToAdminPortal = () => {
		router.push(routes.admin.dashboard);
	};

	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();
	const isAllowedTeam = [TEAM_NAME.WAREHOUSE, TEAM_NAME.OFFICE, TEAM_NAME.PROCUREMENT].includes(
		user?.team?.name as TEAM_NAME
	);
	const canSeeMaterialRequests = !!user?.isMaterialRequestAllowed && (isForeman || isAllowedTeam);
	const canSeeMissingItemRequests = !!user?.isMaterialRequestAllowed;

	const handleMaterialRequestsClick = () => {
		router.push(routes.employee.materialRequests);
	};

	const handleMissingItemRequestsClick = () => {
		router.push(routes.employee.foremanMissingItemRequests);
	};

	return (
		<>
			<div className={`fixed z-[2] w-full bg-brand-bgLightgrey px-4 py-2`}>
				<div className="flex items-center justify-between">
					{/* Left - Logo */}
					<div className="flex items-center gap-2">
						<div className="relative z-10 my-4">
							{/* <Image src="/assets/png/logo1.png" alt="Company Logo" width={160} height={120} /> */}
						</div>
					</div>

					{/* Right - Icons and Avatar */}
					<div className="flex items-center space-x-[-4px]">
						{defaultButtons.map((btn) => (
							<Button
								key={btn.key}
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-md p-0"
								onClick={btn.onClick}
								aria-label={btn.ariaLabel}
								disabled={isTimeLogPending}
							>
								{btn.icon}
							</Button>
						))}
						<div className="flex items-center space-x-1">
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" className="h-6 w-6 rounded-full p-0 pl-2">
										<Avatar className="h-6 w-6 shadow-lg">
											<AvatarImage src="/assets/png/profile.png" alt="User" />
											<AvatarFallback className="bg-white">JS</AvatarFallback>
										</Avatar>
									</Button>
								</PopoverTrigger>
								<PopoverContent
									side="bottom"
									align="end"
									className={`${user?.hasAnyAdminModuleAccess ? "w-50" : "w-50"} min-w-[180px] rounded-[20px] border bg-white p-2 shadow-sm`}
								>
									<div className="flex flex-col gap-1">
										<Button
											disabled={!user ? true : false}
											variant="ghost"
											className="w-full justify-center text-left"
											onClick={handleProfileClick}
										>
											{tCommon.myProfile}
										</Button>
										{user?.hasAnyAdminModuleAccess && (
											<Button
												variant="ghost"
												className="w-full justify-center text-left"
												onClick={handleSwitchToAdminPortal}
												disabled={isTimeLogPending}
											>
												{tCommon.switchToAdminPortal}
											</Button>
										)}

										{canSeeMaterialRequests && (
											<Button
												variant="ghost"
												className="w-full justify-center text-left"
												onClick={handleMaterialRequestsClick}
												disabled={isTimeLogPending}
											>
												Material Review
											</Button>
										)}

										{canSeeMissingItemRequests && (
											<Button
												variant="ghost"
												className="w-full justify-center text-left"
												onClick={handleMissingItemRequestsClick}
												disabled={isTimeLogPending}
											>
												Unknown Items
											</Button>
										)}

										<Button
											disabled={!user ? true : false}
											variant="ghost"
											className="w-full justify-center text-left"
											onClick={handleSmsConsentClick}
										>
											{tCommon.smsConsent}
										</Button>

										<Button
											variant="ghost"
											className="w-full justify-center text-left"
											onClick={() =>
												openModal({
													modalTitle: "",
													modalView: (
														<ReportTechnicalIssue onClose={closeModal} openModal={openModal} isTechnician={true} />
													),
												})
											}
										>
											{tCommon.reportTechnicalIssue}
										</Button>
										<Button
											variant="ghost"
											className="w-full justify-center text-left"
											onClick={() => router.push(routes.employee.releaseNotes)}
										>
											{tTechnician.appUpdates}
										</Button>

										<Button variant="ghost" className="w-full justify-center text-left" onClick={handleSignOut}>
											{tCommon.logout}
										</Button>
									</div>
								</PopoverContent>
							</Popover>
							<Button
								type="button"
								className="ml-4 flex h-8 w-8 items-center justify-center rounded-md p-0"
								onClick={() => setQuickToolsOpen(true)}
								aria-label="Quick tools"
							>
								<Image src="/assets/svg/menu.svg" alt="Quick Tools" height={24} width={24} />
							</Button>
						</div>
					</div>
				</div>
				<Modal />
			</div>
			<QuickToolsDrawer
				open={quickToolsOpen}
				onClose={() => setQuickToolsOpen(false)}
				isTimeLogPending={isTimeLogPending}
				setSelfScheduleOpen={setSelfScheduleOpen}
			/>
		</>
	);
}
