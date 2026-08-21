import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { NOTIFICATION_KEY, NotificationUnion } from "@/types/notification";
import { IOpenModal } from "@/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import RequestExtendedTimeModal from "@/module/job/components/request-extended-time-modal";
import { toDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import useAuthStore from "@/store/auth-store";
import { E_ROLES, TEAM_NAME } from "@/utils/enums";

export const useHandleEmployeeNotification = ({
	openModal,
	closeModal,
}: {
	openModal?: (modal: IOpenModal) => void;
	closeModal?: () => void;
}) => {
	const router = useRouter();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { user } = useAuthStore((state) => state);
	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();
	const isAllowedTeam = [TEAM_NAME.WAREHOUSE, TEAM_NAME.OFFICE, TEAM_NAME.PROCUREMENT].includes(
		user?.team?.name as TEAM_NAME
	);
	const hasMissingItemRequestAccess = !!user?.isMaterialRequestAllowed;
	const hasMaterialRequestAccess = !!user?.isMaterialRequestAllowed && (isForeman || isAllowedTeam);

	const handleNotificationClick = <T extends NOTIFICATION_KEY>({ key, data }: { key: T; data: string }) => {
		const { mappedTitle, parsedData } = {
			mappedTitle: key,
			parsedData: JSON.parse(data),
		} as NotificationUnion;

		if (
			(mappedTitle === NOTIFICATION_KEY.JOB_MARK_AS_NOT_READY ||
				mappedTitle === NOTIFICATION_KEY.JOB_UPDATE_REMINDER ||
				mappedTitle === NOTIFICATION_KEY.JOB_DATE_UPDATE ||
				mappedTitle === NOTIFICATION_KEY.JOB_PUBLISH) &&
			parsedData?.dailyJobId
		) {
			router.push(routes.employee.job(parsedData?.dailyJobId));
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.OVERTIME_REQUEST && parsedData?.dailyJobId) {
			router.push(routes.employee.job(parsedData?.dailyJobId));
			return;
		}

		// Opens the technician's own injury report, prefilled. Violations have no
		// technician-side form, so those notifications stay non-clickable.
		if (mappedTitle === NOTIFICATION_KEY.JOB_SITE_SAFETY_REPORT_CREATED_BY_ADMIN && parsedData?.jobSiteInjuryReportId) {
			router.push(`${routes.employee.newJobSiteInjuryReport}?draftId=${parsedData.jobSiteInjuryReportId}`);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.ADMIN_JOB_ALERT && parsedData?.dailyJobId) {
			router.push(routes.employee.job(parsedData?.dailyJobId));
			return;
		}

		if (
			(mappedTitle === NOTIFICATION_KEY.JOB_NOT_COMPLETED || mappedTitle === NOTIFICATION_KEY.JOB_COMPLETED) &&
			parsedData?.dailyJobId
		) {
			router.push(routes.employee.job(parsedData?.dailyJobId));
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.JOB_TIME_OVERRIDE && parsedData?.dailyJobId) {
			router.push(routes.employee.job(parsedData?.dailyJobId));
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.JOB_SCHEDULE_DATE_CHANGED && parsedData?.dailyJobId) {
			router.push(routes.employee.job(parsedData?.dailyJobId));
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.TECHNICAL_ISSUE_UPDATE) {
			router.push(routes.employee.technicalIssue + `?${parsedData?.issueId ? `issueId=${parsedData.issueId}` : ""}`);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.TRAVEL_PAY_REQUEST) {
			router.push(routes.employee.travelPay + `?${parsedData.date ? `date=${parsedData.date}` : ""}`);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.SCHEDULE_PUBLISHED) {
			router.push(`${routes.employee.dashboard}${parsedData?.startDate ? `?startDate=${parsedData.startDate}` : ""}`);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.ADMIN_ALLOW_WEEKEND_SELF_SCHEDULING) {
			router.push(routes.employee.selfScheduling);
			return;
		}

		if (
			mappedTitle === NOTIFICATION_KEY.ADMIN_ALLOW_SELF_SCHEDULING ||
			mappedTitle === NOTIFICATION_KEY.ADMIN_DISALLOW_WEEKEND_SELF_SCHEDULING ||
			mappedTitle === NOTIFICATION_KEY.ADMIN_DISALLOW_SELF_SCHEDULING
		) {
			router.push(routes.employee.dashboard);

			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.RELEASE_NOTE) {
			router.push(
				`${routes.employee.releaseNotes}${
					parsedData.date ? `?date=${toFormattedDate(parsedData.date, DATE_FORMAT.YYYY_MM_DD)}` : ""
				}`
			);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.APP_UPDATES) {
			router.push(
				`${routes.employee.releaseNotes}${
					parsedData.date ? `?date=${toFormattedDate(parsedData.date, DATE_FORMAT.YYYY_MM_DD)}` : ""
				}`
			);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.ETR) {
			if (!openModal || !closeModal) return;
			openModal({
				modalTitle: tEmployee.extendedTimeRequest,
				modalView: <RequestExtendedTimeModal onClose={closeModal} />,
				variant: "medium",
			});
			return;
		}
		if (mappedTitle === NOTIFICATION_KEY.MIDDAY_STOP) {
			if (parsedData?.dailyJobId) {
				router.push(routes.employee.job(parsedData?.dailyJobId));
			} else {
				router.push(routes.employee.dashboard);
			}
			return;
		}

		if (
			(mappedTitle === NOTIFICATION_KEY.ADMIN_UPDATE_WEEKEND_WORKING_MODE ||
				mappedTitle === NOTIFICATION_KEY.WEEKEND_VOLUNTARY_REQUEST_SENT ||
				mappedTitle === NOTIFICATION_KEY.WEEKEND_VOLUNTARY_EMPLOYEE_RESPONSE_REVIEWED ||
				mappedTitle === NOTIFICATION_KEY.WEEKEND_SLOT_AVAILABLE) &&
			parsedData?.date
		) {
			router.push(routes.employee.dashboard + `?startDate=${toDate(parsedData.date)}`);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.MISSING_ITEM_REQUEST) {
			if (hasMissingItemRequestAccess)
				router.push(
					routes.employee.missingItemRequests +
						`${parsedData?.missingItemRequestId ? `?id=${parsedData.missingItemRequestId}` : ""}`
				);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.MISSING_ITEM_REQUEST_NOTE) {
			if (hasMissingItemRequestAccess)
				router.push(
					routes.employee.missingItemRequests +
						`${parsedData?.missingItemRequestId ? `?id=${parsedData.missingItemRequestId}` : ""}`
				);
			return;
		}

		if (
			mappedTitle === NOTIFICATION_KEY.MISSING_ITEM_REQUEST_REJECTED ||
			mappedTitle === NOTIFICATION_KEY.MISSING_ITEM_CONVERTED_TO_MATERIAL_REQUEST
		) {
			if (hasMissingItemRequestAccess)
				router.push(
					routes.employee.missingItemRequests +
						`${parsedData?.missingItemRequestId ? `?id=${parsedData.missingItemRequestId}` : ""}`
				);
			return;
		}

		if (
			(mappedTitle === NOTIFICATION_KEY.VEHICLE_ACCIDENT_INFO_REQUESTED ||
				mappedTitle === NOTIFICATION_KEY.DRUG_SCREEN_REQUIRED_TECHNICIAN) &&
			parsedData?.vehicleAccidentReportId
		) {
			router.push(routes.employee.newVehicleAccidentReport + `?draftId=${parsedData.vehicleAccidentReportId}`);
			return;
		}

		if (mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST) {
			if (hasMaterialRequestAccess)
				router.push(
					routes.employee.materialRequests +
						`${parsedData?.materialRequestId ? `?requestNumber=${parsedData.materialRequestId}` : ""}`
				);
			return;
		}

		if (
			mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST_ASSIGNED ||
			mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST_APPROVED ||
			mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST_APPROVED_CREW ||
			mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST_REJECTED ||
			mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST_REJECTED_CREW ||
			mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST_REASSIGNED_CREW ||
			mappedTitle === NOTIFICATION_KEY.MATERIAL_REQUEST_NOTE
		) {
			if (hasMaterialRequestAccess)
				router.push(
					routes.employee.materialRequests + `${parsedData?.requestId ? `?requestNumber=${parsedData.requestId}` : ""}`
				);
			return;
		}
	};

	return { handleNotificationClick };
};
