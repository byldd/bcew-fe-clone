import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { NOTIFICATION_KEY, NotificationUnion } from "@/types/notification";

export const useHandleSubContractorNotification = ({ isAdmin }: { isAdmin: boolean }) => {
	const router = useRouter();

	const pathname = usePathname();

	const handleNotificationClick = ({ key, data }: { key: NOTIFICATION_KEY; data?: string }) => {
		const { mappedTitle, parsedData } = {
			mappedTitle: key,
			parsedData: data ? JSON.parse(data) : {},
		} as NotificationUnion;

		if (mappedTitle === NOTIFICATION_KEY.JOB_MARK_AS_NOT_READY && parsedData?.dailyJobId) {
			router.push(
				isAdmin
					? routes.subContractor.adminJob(parsedData?.dailyJobId)
					: routes.subContractor.crewLeaderJob(parsedData?.dailyJobId)
			);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.SCHEDULE_PUBLISHED) {
			if (pathname === routes?.subContractorAdminDesktop?.notification) {
				router.push(
					`${routes?.subContractorAdminDesktop?.weeklySchedule}${parsedData?.startDate && parsedData?.endDate ? `?startDate=${parsedData.startDate}&endDate=${parsedData.endDate}` : ""}`
				);
				return;
			}

			router.push(
				isAdmin
					? `${routes.subContractor.adminDashboard}${parsedData?.startDate ? `?startDate=${parsedData.startDate}` : ""}`
					: routes.subContractor.crewLeaderDashboard
			);
			return;
		}

		if (
			(mappedTitle === NOTIFICATION_KEY.JOB_MARK_AS_NOT_READY ||
				mappedTitle === NOTIFICATION_KEY.JOB_UPDATE_REMINDER ||
				mappedTitle === NOTIFICATION_KEY.JOB_DATE_UPDATE ||
				mappedTitle === NOTIFICATION_KEY.ADMIN_JOB_ALERT ||
				mappedTitle === NOTIFICATION_KEY.JOB_PUBLISH ||
				mappedTitle === NOTIFICATION_KEY.JOB_MARK_AS_NOT_READY_BY_SUB_CREW ||
				mappedTitle === NOTIFICATION_KEY.JOB_NOT_COMPLETED_BY_SUB_CREW) &&
			parsedData?.dailyJobId
		) {
			router.push(
				isAdmin
					? routes.subContractor.adminJob(parsedData?.dailyJobId)
					: routes.subContractor.crewLeaderJob(parsedData?.dailyJobId)
			);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.ADMIN_JOB_ALERT && parsedData?.dailyJobId) {
			router.push(routes.subContractor.adminJob(parsedData?.dailyJobId));
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.TECHNICAL_ISSUE_UPDATE) {
			const query = parsedData?.issueId ? `?issueId=${parsedData.issueId}` : "";

			const path = isAdmin ? routes.subContractor.adminTechnicalIssue : routes.subContractor.crewLeaderTechnicalIssue;

			router.push(path + query);
			return;
		}
	};

	return { handleNotificationClick };
};
