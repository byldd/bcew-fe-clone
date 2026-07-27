"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useModal } from "@/hooks/useModal";
import { dateToUTCString, toDate, toFormattedDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import { useEmployeeDayVarianceStatus, useEmployeePendingLateness } from "./useEmployeeSchedule";
import { useEmployeeScheduleParams } from "./useEmployeeScheduleParams";
import { openErrorToast } from "@/components/toast";

/**
 * Guards primary technician actions (log time, start/end day, timer, etc.) behind an
 * unresolved late-arrival / early-quit response.
 *
 * Usage:
 *   const { PendingLatenessModal, guardPendingLateness } = usePendingLatenessGuard();
 *   // render <PendingLatenessModal /> once, then:
 *   onClick={() => guardPendingLateness(onTimeLogClick)}
 *
 * When a reason is pending the action is blocked and an "Action Required" modal opens that
 * redirects the technician to the pending day (redirectDate) on the dashboard.
 */
export const usePendingLatenessGuard = () => {
	const router = useRouter();
	const { openModal, closeModal, Modal } = useModal();
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const { data: pendingLateness } = useEmployeePendingLateness(dateToUTCString(startDate));

	const { data: dayVarianceStatus } = useEmployeeDayVarianceStatus(dateToUTCString(startDate));

	const hasPendingReason = !!pendingLateness?.hasPendingReason;

	const hasPendingCurrentDayVariance =
		(dayVarianceStatus?.isLateArrival && dayVarianceStatus?.pendingLate) ||
		(dayVarianceStatus?.isEarlyLogout && dayVarianceStatus?.pendingEarly);

	const openPendingLatenessModal = () => {
		openModal({
			modalTitle: "Action Required",
			showDefaultClose: false,
			modalView: (
				<div className="space-y-4">
					<p className="mt-2 text-start text-sm">
						{`Your response for the late arrival or early quit on ${toFormattedDate(
							pendingLateness!.redirectDate!
						)} is pending. Please complete it to continue.`}
					</p>

					<Button
						className="mt-4 w-full"
						variant={"filled"}
						onClick={() => {
							if (pendingLateness?.redirectDate) {
								const params = new URLSearchParams({
									startDate: toDate(pendingLateness.redirectDate).toString(),
								});
								router.push(`${routes.employee.dashboard}?${params.toString()}`);
							}
							closeModal();
						}}
					>
						OK
					</Button>
				</div>
			),
		});
	};

	/**
	 * Runs `action` unless a late/early-quit response is still pending, in which case the
	 * "Action Required" modal is shown instead. Returns true when the action was blocked.
	 */
	const guardPendingLateness = (action: () => void) => {
		// Previous working day
		if (hasPendingReason) {
			openPendingLatenessModal();
			return true;
		}

		// Current day
		if (hasPendingCurrentDayVariance) {
			openErrorToast({
				message: "Please answer today's late arrival or early quit question before logging your time.",
			});
			return true;
		}

		action();
		return false;
	};

	return { PendingLatenessModal: Modal, guardPendingLateness, hasPendingReason };
};
