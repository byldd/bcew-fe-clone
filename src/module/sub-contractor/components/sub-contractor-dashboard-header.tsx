"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { LegendContent } from "@/module/employee-dashboard/components/legend-modal-content";
import React from "react";
import { HeaderButton } from "@/module/employee-dashboard/types";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useModal } from "@/hooks/useModal";
import ProfileModal from "@/components/common/profile-modal";

import Image from "next/image";
import useAuthStore from "@/store/auth-store";
import { LOGIN_MODE } from "@/utils/enums";
import { AUTH_QUERY_PARAM } from "@/module/auth/utils/constants";
import { ROLES } from "@/types";
import ReportTechnicalIssue from "@/module/employee-technical-issue/report-technical-bug/components/report-technical-issue";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import UnreadNotificationCount from "./unread-notification-count";
import SmsConsent from "@/components/shared/sms-consent";
import CrewLeaderUnreadNotificationCount from "./crew-leader-unread-notification-count";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";

export function SubContractorDashboardHeader() {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const router = useRouter();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { useSignout } = useAuthAPI();
	const { signout } = useSignout();

	const defaultButtons: HeaderButton[] = [
		{
			key: "legend",
			icon: (
				<div className="relative h-[24px] w-[24px]">
					<Image src="/assets/svg/info.svg" alt="Legend" height={28} width={28} />
				</div>
			),

			onClick: () =>
				openModal({
					modalTitle: tschedule.legends,
					modalView: <LegendContent />,
				}),
			variant: "secondary",

			ariaLabel: "Show legend",
		},

		{
			key: "notification",
			icon: (
				<div className="relative h-[24px] w-[24px]">
					<Image src="/assets/svg/bell.svg" alt="Notification" height={28} width={28} />
					{user && user?.id ? (
						<UnreadNotificationCount />
					) : subcontractorCrew && subcontractorCrew?.id ? (
						<CrewLeaderUnreadNotificationCount />
					) : (
						<></>
					)}
				</div>
			),
			onClick: () =>
				router.push(user ? routes.subContractor.adminNotification : routes.subContractor.crewLeaderNotification),
			variant: "filled",
			className: "bg-brand-dark text-white text-xs font-medium  h-8 py-1 ",
		},
	];
	const { Modal, closeModal, openModal } = useModal();

	const handleSignOut = () => {
		if (!user && !subcontractorCrew) return;

		signout();

		if (subcontractorCrew) {
			const url = new URL(routes.signIn, window.location.origin);
			url.searchParams.set(AUTH_QUERY_PARAM.LOGIN, LOGIN_MODE.SUB_CONTRACTOR_CREW_LEADER);
			router.replace(url.toString());
			return;
		}

		router.replace(routes.signIn);
	};

	const handleProfileClick = () => {
		if (!user && !subcontractorCrew) return;
		openModal({
			modalTitle: tCommon.myProfile,
			modalView: <ProfileModal onClose={closeModal} />,
		});
	};

	const handleSmsConsentClick = () => {
		openModal({
			modalView: <SmsConsent onClose={closeModal} isSubCrew={!!subcontractorCrew} />,
			showDefaultClose: false,
		});
	};

	const handleRedirectDesktopView = () => {
		router.push(routes.subContractorAdminDesktop.weeklySchedule);
	};
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	return (
		<div className="fixed z-[2] w-full bg-brand-bgLightgrey px-4 py-2">
			<div className="flex items-center justify-between">
				{/* Left - Logo */}
				<div className="relative z-10 my-4">
					{/* <Image src="/assets/png/logo1.png" alt="Company Logo" width={160} height={120} /> */}
				</div>

				{/* Right - Icons and Avatar */}

				<div className="flex items-center gap-1">
					<Button
						disabled={!user && !subcontractorCrew ? true : false}
						type="button"
						variant={"filled"}
						className="h-7 w-full rounded-[8px] bg-brand-dark px-2 py-1 text-xs font-medium text-white"
						onClick={() => {
							if (!user && !subcontractorCrew) return;
							return user
								? router.push(routes.subContractor.adminAllCrews)
								: router.push(routes.subContractor.crewLeaderAllCrews);
						}}
					>
						{tSub.allCrews}
					</Button>

					{defaultButtons.map((btn) => (
						<Button
							key={btn.key}
							disabled={!user && !subcontractorCrew ? true : false}
							type="button"
							className="flex h-8 w-8 items-center justify-center rounded-md p-0"
							onClick={btn.onClick}
							aria-label={btn.ariaLabel}
						>
							{btn.icon}
						</Button>
					))}

					<div className="flex items-center space-x-3">
						<Popover>
							<PopoverTrigger asChild disabled={!user && !subcontractorCrew ? true : false}>
								<Button variant="ghost" className="h-6 w-6 rounded-full p-0">
									<Avatar className="h-[26px] w-[26px] shadow-lg">
										<AvatarImage src="/assets/png/profile.png" alt="User" />
										<AvatarFallback className="bg-white">JS</AvatarFallback>
									</Avatar>
								</Button>
							</PopoverTrigger>
							<PopoverContent side="bottom" align="end" className="w-45 rounded-[20px] border bg-white shadow-lg">
								<div className="flex flex-col gap-1">
									<Button variant="ghost" className="w-full justify-center text-left" onClick={handleProfileClick}>
										{tCommon.myProfile}
									</Button>

									<Button variant="ghost" className="w-full justify-center text-left" onClick={handleSmsConsentClick}>
										{tCommon.smsConsent}
									</Button>

									{user?.userType === ROLES?.SUB_CONTRACTOR && (
										<Button
											variant="ghost"
											className="w-full justify-center text-left"
											onClick={handleRedirectDesktopView}
										>
											{tCommon.switchToDesktopView}
										</Button>
									)}

									<Button
										variant="ghost"
										className="w-full justify-center text-left"
										onClick={() =>
											openModal({
												modalView: (
													<ReportTechnicalIssue onClose={closeModal} openModal={openModal} isTechnician={true} />
												),
											})
										}
									>
										{tCommon.reportTechnicalIssue}
									</Button>

									<Button variant="ghost" className="w-full justify-center text-left" onClick={handleSignOut}>
										{tCommon.logout}
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</div>
			<Modal />
		</div>
	);
}
