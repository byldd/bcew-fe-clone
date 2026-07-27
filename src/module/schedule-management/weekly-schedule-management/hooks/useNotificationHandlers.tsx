import { IOpenModal } from "@/types";
import { NOTIFICATION_KEY, NotificationUnion } from "@/types/notification";
import MarkJobAsNotReadyModal from "../modals/not-ready-job-modal";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { EditJobModal } from "../modals/edit-job-modal";
import TakeActionModal from "@/module/employee-technical-issue/report-technical-bug/components/take-action-modal";
import AcceptMDTRModal from "../../time-requests/components/accept-mdtr-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import AcceptETRModal from "../../time-logs-management/components/accept-etr-modal";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import RoleUpdateHistoryDetails from "@/module/employee/components/role-update-history-deatils";
import UserPageUpdateHistoryDetails from "@/module/employee/components/user-page-update-history-details";

/**
 * Admin Notification Handlers
 */
export const useAdminNotificationHandlers = ({
	openModal,
	closeModal,
}: {
	openModal?: (modal: IOpenModal) => void;
	closeModal?: () => void;
}) => {
	const router = useRouter();
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const handleNotificationClick = <T extends NOTIFICATION_KEY>({ key, data }: { key: T; data: string }) => {
		const { mappedTitle, parsedData } = {
			mappedTitle: key,
			parsedData: JSON.parse(data),
		} as NotificationUnion;

		switch (mappedTitle) {
			case NOTIFICATION_KEY.JOB_MARK_AS_NOT_READY_BY_EMPLOYEE: {
				if (!parsedData?.dailyJobId || !openModal || !closeModal) return;

				openModal({
					modalTitle: "Review Site Status",
					modalView: <MarkJobAsNotReadyModal dailyJobId={parsedData.dailyJobId} onClose={closeModal} />,
					variant: "medium",
					subHeader: "The crew has updated the site details. Please review them and update the site status accordingly",
				});
				return;
			}

			case NOTIFICATION_KEY.JOB_UPDATE_REMINDER: {
				if (!parsedData?.dailyJobId) return;
				router.push(routes.employee.job(parsedData.dailyJobId));
				return;
			}

			case NOTIFICATION_KEY.DAY_LOG_TIME_MISMATCH:
			case NOTIFICATION_KEY.LATE_DAY_START:
			case NOTIFICATION_KEY.EARLY_DAY_START: {
				router.push(
					routes.admin.roster +
						`?${parsedData?.employeeId ? `employeeId=${parsedData.employeeId}&` : ""}${parsedData?.date ? `date=${parsedData.date}` : ""}`
				);
				return;
			}

			case NOTIFICATION_KEY.JOB_NOT_COMPLETED:
			case NOTIFICATION_KEY.FOREMAN_ADDED_STOP:
			case NOTIFICATION_KEY.OVERTIME_REQUEST:
			case NOTIFICATION_KEY.JOB_SCHEDULE_DATE_CHANGED:
			case NOTIFICATION_KEY.EMPLOYEE_RESCHEDULED_JOB:
			case NOTIFICATION_KEY.EMPLOYEE_ADDED_NOTE: {
				if (!parsedData?.dailyJobId || !openModal || !closeModal) return;

				openModal({
					modalTitle: parsedData?.jobName,
					modalView: <EditJobModal dailyJobId={parsedData.dailyJobId} closeModal={closeModal} />,
					variant: "medium",
				});
				return;
			}

			case NOTIFICATION_KEY.ETR:
				if (!parsedData?.id || !openModal || !closeModal) return;
				openModal({
					modalTitle: tTimeLogs.extendedTimeRequest,
					modalView: <AcceptETRModal extendedTimeId={parsedData.id} onClose={closeModal} />,
					variant: "medium",
				});
				return;

			case NOTIFICATION_KEY.EMPLOYEE_LATE_REASON:
			case NOTIFICATION_KEY.LATE_START_AND_EARLY_QUIT:
				router.push(
					routes.admin.latenessDetection +
						`?${parsedData?.employeeId ? `employeeId=${parsedData.employeeId}&` : ""}${parsedData?.date ? `date=${parsedData.date}` : ""}`
				);

				return;

			case NOTIFICATION_KEY.ATTENDANCE_APPROVAL:
				router.push(routes.admin.roster);
				return;

			case NOTIFICATION_KEY.FINGERPRINT_WORKING_INDICATED:
				router.push(
					routes.admin.timeRequests +
						`?${parsedData?.employeeId ? `employeeId=${parsedData.employeeId}&` : ""}${parsedData?.date ? `date=${toFormattedDate(parsedData.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}&` : ""}tab=fingerprint-approval`
				);
				return;

			case NOTIFICATION_KEY.FINGERPRINT_LEAVE_CONFIRMED:
				router.push(
					routes.admin.roster +
						`?${parsedData?.employeeId ? `employeeId=${parsedData.employeeId}&` : ""}${parsedData?.date ? `date=${parsedData.date}` : ""}`
				);
				return;

			case NOTIFICATION_KEY.MIDDAY_STOP:
				if (!parsedData?.id || !openModal || !closeModal) return;
				openModal({
					modalTitle: tTimeLogs.newJobRequest,
					modalView: <AcceptMDTRModal middayStopId={parsedData.id} onClose={closeModal} />,
				});
				return;

			case NOTIFICATION_KEY.GPS_TIME_MISMATCH:
				router.push(
					routes.admin.timeLogs +
						`?${parsedData?.employeeId ? `employeeId=${parsedData.employeeId}&` : ""}${
							parsedData?.date ? `startDate=${toFormattedDate(parsedData.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}` : ""
						}`
				);
				return;

			case NOTIFICATION_KEY.TECHNICAL_ISSUE:
				if (!parsedData?.technicalIssueId || !openModal || !closeModal) return;

				openModal({
					modalTitle: `Ticket #${parsedData.ticketNumber}`,
					modalView: <TakeActionModal issueId={parsedData.technicalIssueId} onClose={closeModal} />,
				});
				return;

			case NOTIFICATION_KEY.SYSTEM_TRAVEL_PAY_REQUEST_STATUS_UPDATE:
				router.push(routes.admin.travelPay);
				return;

			case NOTIFICATION_KEY.TRAVEL_PAY_REQUEST:
			case NOTIFICATION_KEY.TRAVEL_PAY_REQUEST_NOTE_ADDED:
			case NOTIFICATION_KEY.TRAVEL_PAY_REQUEST_CREATED:
				router.push(
					routes.admin.travelPay + `?date=${parsedData?.date}&travelPayRequestId=${parsedData?.travelPayRequestId}`
				);
				return;

			case NOTIFICATION_KEY.EMPLOYEE_GPS_OFFLINE:
				router.push(routes.admin.technicalIssues);
				return;

			case NOTIFICATION_KEY.RELEASE_NOTE: {
				router.push(
					`${routes.admin.releaseNotes}${
						parsedData.date ? `?date=${toFormattedDate(parsedData.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}` : ""
					}`
				);
				return;
			}
			case NOTIFICATION_KEY.VEHICLE_SWAP:
				router.push(
					routes.admin.timeLogs +
						`?${parsedData?.employeeId ? `employeeId=${parsedData.employeeId}&` : ""}${
							parsedData?.date ? `startDate=${toFormattedDate(parsedData.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}` : ""
						}`
				);
				return;

			case NOTIFICATION_KEY.WEEKEND_VOLUNTARY_RESPONSE_SUBMITTED:
				router.push(routes.admin.configuration);
				return;

			case NOTIFICATION_KEY.WORK_ORDER_SCHEDULED:
				if (parsedData?.ordnum && parsedData.date) {
					router.push(routes.admin.weeklySchedule + `?startDate=${parsedData.date}&search=${parsedData.ordnum}`);
				}
				return;

			case NOTIFICATION_KEY.EMPLOYEE_SELF_SCHEDULED_JOB:
			case NOTIFICATION_KEY.EMPLOYEE_WEEKEND_SELF_SCHEDULED_JOB:
				if (!parsedData?.dailyJobId || !openModal || !closeModal) return;

				openModal({
					modalTitle: parsedData?.jobName,
					modalView: <EditJobModal dailyJobId={parsedData.dailyJobId} closeModal={closeModal} />,
					variant: "medium",
				});
				return;

			case NOTIFICATION_KEY.JOB_MARKED_AS_DNW:
				if (!parsedData?.dailyJobId || !openModal || !closeModal) return;

				openModal({
					modalTitle: parsedData?.jobName,
					modalView: <EditJobModal dailyJobId={parsedData.dailyJobId} closeModal={closeModal} />,
					variant: "medium",
				});
				return;

			case NOTIFICATION_KEY.GPS_AFTER_HOUR_USAGE:
				router.push(
					routes.admin.gpsExceptionEvents +
						"?" +
						`${parsedData?.date ? `date=${parsedData.date}&` : ""} ${parsedData?.userId ? `userId=${parsedData.userId}` : ""}`
				);
				return;

			case NOTIFICATION_KEY.GPS_AFTER_HOUR_USAGE_NOTE:
				if (!openModal || !closeModal) return;

				if (!parsedData?.explanation && !parsedData?.userName) {
					router.push(
						routes.admin.gpsExceptionEvents +
							"?" +
							`${parsedData?.date ? `date=${parsedData.date}&` : ""} ${parsedData?.userId ? `userId=${parsedData.userId}` : ""}`
					);
					return;
				}
				openModal({
					modalTitle: `${parsedData?.userName} added note for GPS After Hour Usage`,
					modalView: (
						<div>
							<p>{parsedData.explanation}</p>
						</div>
					),
					variant: "medium",
				});
				return;

			case NOTIFICATION_KEY.MATERIAL_REQUEST:
				router.push(
					routes.admin.materialRequests +
						`${parsedData?.materialRequestId ? `?requestNumber=${parsedData.materialRequestId}` : ""}`
				);
				return;

			case NOTIFICATION_KEY.MATERIAL_REQUEST_NOTE:
				router.push(
					routes.admin.materialRequests + `${parsedData?.requestId ? `?requestNumber=${parsedData.requestId}` : ""}`
				);
				return;

			case NOTIFICATION_KEY.MATERIAL_REQUEST_REASSIGNED:
			case NOTIFICATION_KEY.MATERIAL_REQUEST_REASSIGNED_CREW:
			case NOTIFICATION_KEY.MATERIAL_REQUEST_CROSS_ASSIGNED:
				router.push(
					routes.admin.materialRequests + `${parsedData?.requestId ? `?requestNumber=${parsedData.requestId}` : ""}`
				);
				return;

			case NOTIFICATION_KEY.MISSING_ITEM_REQUEST:
				router.push(
					routes.admin.missingItemRequests +
						`${parsedData?.missingItemRequestId ? `?id=${parsedData.missingItemRequestId}` : ""}`
				);
				return;

			case NOTIFICATION_KEY.ROLE_PERMISSION_UPDATED:
				if (!openModal || !closeModal) return;

				openModal({
					modalTitle: "Roles & Permissions",
					modalView: <RoleUpdateHistoryDetails historyId={parsedData.historyId} closeModal={closeModal} />,
				});
				return;

			case NOTIFICATION_KEY.USER_PERMISSION_UPDATED:
				if (!openModal || !closeModal) return;

				openModal({
					modalTitle: "Roles & Permissions",
					modalView: <UserPageUpdateHistoryDetails historyId={parsedData.historyId} closeModal={closeModal} />,
				});
				return;

			case NOTIFICATION_KEY.USER_ROLE_UPDATED:
				if (parsedData?.roleId) return;

				router.push(routes.admin.roleDetails(parsedData.roleId));

			default:
				return;
		}
	};

	return { handleNotificationClick };
};
