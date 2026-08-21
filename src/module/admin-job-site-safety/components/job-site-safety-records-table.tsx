"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/datatable/datatable";
import { DataTablePaginationProps } from "@/components/shared/datatable/data-table-pagination";
import ConfirmModal from "@/components/confirm-modal";
import { useModal } from "@/hooks/useModal";
import { routes } from "@/config/routes";
import useAuthStore from "@/store/auth-store";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import {
	ADD_RECORD_TAB,
	JOB_SITE_SAFETY_ACTION,
	JOB_SITE_SAFETY_REPORT_TYPE,
	JOB_SITE_SAFETY_STATUS_ACTION,
} from "../enums";
import {
	useApproveAndSendToInsurance,
	useApproveInternally,
	useMarkReadyForInsurance,
	useMarkResolved,
} from "../hooks/useJobSiteInjuryDetail";
import { IJobSiteSafetyDashboardRow } from "../types";
import { getJobSiteSafetyDashboardColumns } from "../utils/job-site-safety-dashboard-columns";
import {
	APPROVE_AND_SEND_TO_INSURANCE_CONFIRM,
	APPROVE_INTERNALLY_CONFIRM,
	MARK_READY_FOR_INSURANCE_CONFIRM,
	resolveJobSiteSafetyAction,
} from "../utils/dashboard-constants";
import { JOB_SITE_SAFETY_STATUS_ACTION_SUCCESS } from "../utils/status-actions";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";

const JobSiteSafetyRecordsTable = ({
	data,
	isLoading,
	paginatorOptions,
}: {
	data: IJobSiteSafetyDashboardRow[];
	isLoading: boolean;
	paginatorOptions?: DataTablePaginationProps;
}) => {
	const router = useRouter();
	const { Modal, openModal, closeModal } = useModal();
	const { pageAccess } = useAdminPageAccessContext();

	const { user } = useAuthStore((state) => state);

	const markReadyForInsurance = useMarkReadyForInsurance();
	const approveAndSendToInsurance = useApproveAndSendToInsurance();
	const approveInternally = useApproveInternally();
	const markResolved = useMarkResolved();

	const runStatusAction = useCallback(
		async (record: IJobSiteSafetyDashboardRow, action: JOB_SITE_SAFETY_STATUS_ACTION) => {
			const mutation = {
				[JOB_SITE_SAFETY_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW]: markReadyForInsurance,
				[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE]: approveAndSendToInsurance,
				[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_INTERNALLY]: approveInternally,
				[JOB_SITE_SAFETY_STATUS_ACTION.MARK_RESOLVED]: markResolved,
			}[action];

			try {
				await mutation.mutateAsync(record.id);
				openSuccessToast(JOB_SITE_SAFETY_STATUS_ACTION_SUCCESS[action]);
			} catch (error) {
				openErrorToast({ error: error as Error });
			}
		},
		[markReadyForInsurance, approveAndSendToInsurance, approveInternally, markResolved]
	);

	// Every approval step is irreversible, so the list confirms them with the same
	// copy the review page uses. Marking resolved just closes an already-sent
	// claim, which is the one step that needs no warning.
	const onStatusAction = useCallback(
		(record: IJobSiteSafetyDashboardRow, action: JOB_SITE_SAFETY_STATUS_ACTION) => {
			const confirmCopy = {
				[JOB_SITE_SAFETY_STATUS_ACTION.MARK_FOR_PRESIDENT_REVIEW]: MARK_READY_FOR_INSURANCE_CONFIRM,
				[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_AND_SEND_TO_INSURANCE]: APPROVE_AND_SEND_TO_INSURANCE_CONFIRM,
				[JOB_SITE_SAFETY_STATUS_ACTION.APPROVE_INTERNALLY]: APPROVE_INTERNALLY_CONFIRM,
				[JOB_SITE_SAFETY_STATUS_ACTION.MARK_RESOLVED]: null,
			}[action];

			if (!confirmCopy) {
				runStatusAction(record, action);
				return;
			}

			openModal({
				modalTitle: confirmCopy.title,
				modalView: (
					<ConfirmModal
						description={confirmCopy.description}
						confirmText={confirmCopy.confirmText}
						onConfirm={() => {
							closeModal();
							runStatusAction(record, action);
						}}
						onCancel={closeModal}
					/>
				),
			});
		},
		[openModal, closeModal, runStatusAction]
	);

	const onView = useCallback(
		(record: IJobSiteSafetyDashboardRow) => {
			if (resolveJobSiteSafetyAction(record) === JOB_SITE_SAFETY_ACTION.CONTINUE) {
				router.push(
					`${routes.admin.jobSiteSafetyAddNewRecord}?tab=${ADD_RECORD_TAB.JOB_SITE_INJURY}&draftId=${record.id}`
				);
				return;
			}

			// Review and See Details land on the same page — it already renders
			// view-only once the record is closed.
			router.push(
				record.type === JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_SAFETY_VIOLATION
					? routes.admin.jobSiteSafetyViolationReview(record.id)
					: routes.admin.jobSiteSafetyInjuryReview(record.id)
			);
		},
		[router]
	);

	const columns = useMemo(
		() =>
			getJobSiteSafetyDashboardColumns(onView, {
				roleName: user?.role?.name,
				onStatusAction,
				accessLevel: pageAccess?.accessLevel,
			}),
		[onView, user?.role?.name, onStatusAction, pageAccess]
	);

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				compact
				mobileCompact
				useSectionHeader={false}
				paginatorOptions={paginatorOptions}
			/>
			<Modal />
		</>
	);
};

export default JobSiteSafetyRecordsTable;
