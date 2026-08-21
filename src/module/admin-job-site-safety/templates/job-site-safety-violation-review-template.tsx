"use client";

import { useRouter } from "next/navigation";
import SidebarBackButton from "@/components/common/sidebar-back-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/utils";
import { routes } from "@/config/routes";
import { ReviewCard } from "@/module/driving-safety/incident-reports/components/review-card";
import { SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import ConfirmModal from "@/components/confirm-modal";
import { useModal } from "@/hooks/useModal";
import useAuthStore from "@/store/auth-store";
import { ADD_RECORD_TAB, JOB_SITE_SAFETY_REPORT_TYPE, JOB_SITE_SAFETY_REVIEWER_ROLE } from "../enums";
import JobSiteSafetyLifecycle from "../components/job-site-safety-lifecycle";
import {
	useApproveAndSendViolationToInsurance,
	useApproveViolationInternally,
	useMarkViolationReadyForInsurance,
	useMarkViolationResolved,
	useViolationReportDetail,
} from "../hooks/useViolationDetail";
import {
	APPROVE_AND_SEND_TO_INSURANCE_CONFIRM,
	APPROVE_INTERNALLY_CONFIRM,
	IS_VIOLATION_WORKFLOW_ENABLED,
	JOB_SITE_SAFETY_VIOLATION_REPORT_PREFIX,
	MARK_READY_FOR_INSURANCE_CONFIRM,
	resolveSafetyReportStatusMeta,
	formatJobSiteSafetyReportNumber,
} from "../utils/dashboard-constants";
import JobSiteSafetyViolationSummary from "../components/job-site-safety-violation-summary";

const HintText = ({ children }: { children: React.ReactNode }) => (
	<p className="mb-3 text-sm text-brand-dark50">{children}</p>
);

const StageHeading = ({ children }: { children: React.ReactNode }) => (
	<p className="mb-1 text-sm font-semibold text-brand-dark">{children}</p>
);

const CLOSED_STATUSES: SAFETY_REPORT_STATUS[] = [
	SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY,
	SAFETY_REPORT_STATUS.RESOLVED,
];

// Editing is only ever possible while the violation is still moving through the
// President/Fleet Manager stages — once the insurance email has gone out
// (or the record is closed), the original data is frozen for good.
const EDITABLE_STATUSES: SAFETY_REPORT_STATUS[] = [
	SAFETY_REPORT_STATUS.PENDING,
	SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW,
];

interface JobSiteSafetyViolationReviewTemplateProps {
	id: string;
}

const JobSiteSafetyViolationReviewTemplate = ({ id }: JobSiteSafetyViolationReviewTemplateProps) => {
	const router = useRouter();
	const { data: violation, isLoading } = useViolationReportDetail(id);

	const markReadyForInsurance = useMarkViolationReadyForInsurance();
	const approveInternally = useApproveViolationInternally();
	const approveAndSendToInsurance = useApproveAndSendViolationToInsurance();
	const markResolved = useMarkViolationResolved();

	const { Modal, openModal, closeModal } = useModal();

	const { user } = useAuthStore((state) => state);
	const isPresident = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.PRESIDENT;
	const isFleetManager = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;

	if (isLoading || !violation) {
		return (
			<div className="flex h-40 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	const statusMeta = resolveSafetyReportStatusMeta(violation.status);
	// The President's insurance approval freezes the report — the Fleet Manager has
	// to review exactly what was approved.
	const showEditButton =
		IS_VIOLATION_WORKFLOW_ENABLED && EDITABLE_STATUSES.includes(violation.status) && !violation.approvedForInsuranceAt;

	const onMarkReadyForInsurance = async () => {
		try {
			await markReadyForInsurance.mutateAsync(id);
			openSuccessToast("Marked ready for insurance");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const onApproveInternally = async () => {
		try {
			await approveInternally.mutateAsync(id);
			openSuccessToast("Report approved internally");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const onApproveAndSendToInsurance = async () => {
		try {
			await approveAndSendToInsurance.mutateAsync(id);
			openSuccessToast("Approved — sent for Fleet Manager's review");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const onMarkResolved = async () => {
		try {
			await markResolved.mutateAsync(id);
			openSuccessToast("Report marked resolved");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	// The approval actions all hand the report off irreversibly, so they go through
	// a confirmation step rather than firing on the first click.
	const confirmAction = (
		{ title, description, confirmText }: { title: string; description: string; confirmText: string },
		action: () => Promise<void>
	) =>
		openModal({
			modalTitle: title,
			headerClassName: "border-b border-brand-dark10 pb-3",
			modalView: (
				<ConfirmModal
					description={<span className="mt-3 block text-sm leading-relaxed text-brand-dark50">{description}</span>}
					confirmText={confirmText}
					onConfirm={() => {
						closeModal();
						action();
					}}
					onCancel={closeModal}
				/>
			),
		});

	const canPresidentAct =
		isPresident && !violation.approvedForInsuranceAt && !CLOSED_STATUSES.includes(violation.status);
	const canFleetManagerApproveInternally =
		isFleetManager && !violation.approvedForInsuranceAt && !CLOSED_STATUSES.includes(violation.status);
	const canMarkResolved =
		(isPresident || isFleetManager) && violation.status === SAFETY_REPORT_STATUS.SUBMITTED_TO_INSURANCE;

	const approveInternallyButton = (disabled = false) => (
		<Button
			type="button"
			variant="outline"
			className="w-full"
			disabled={disabled}
			loading={approveInternally.isPending}
			onClick={() => confirmAction(APPROVE_INTERNALLY_CONFIRM, onApproveInternally)}
		>
			Resolve Internally
		</Button>
	);

	const renderApprovalStage = () => {
		if (violation.status === SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY) {
			return (
				<div className="space-y-1">
					<StageHeading>Resolved Internally</StageHeading>
					<HintText>Points applied, record closed. No further action is available.</HintText>
				</div>
			);
		}

		if (canMarkResolved) {
			return (
				<div className="space-y-2">
					<HintText>This claim has been sent to the insurer.</HintText>
					<Button
						type="button"
						variant="filled"
						className="w-full"
						loading={markResolved.isPending}
						onClick={onMarkResolved}
					>
						Approved
					</Button>
				</div>
			);
		}

		if (violation.status === SAFETY_REPORT_STATUS.RESOLVED) {
			return (
				<div>
					<StageHeading>Resolved</StageHeading>
					<HintText>This record is closed. No further action is available.</HintText>
				</div>
			);
		}

		if (canPresidentAct) {
			return (
				<div className="space-y-2">
					<Button
						type="button"
						variant="filled"
						className="w-full"
						loading={approveAndSendToInsurance.isPending}
						onClick={() => confirmAction(APPROVE_AND_SEND_TO_INSURANCE_CONFIRM, onApproveAndSendToInsurance)}
					>
						Approve &amp; Send to Insurance
					</Button>
					{approveInternallyButton()}
				</div>
			);
		}

		if (violation.status === SAFETY_REPORT_STATUS.PENDING) {
			return (
				<div className="mt-3 space-y-2">
					<HintText>First-level approver reviews and marks the report ready.</HintText>
					<Button
						type="button"
						variant="filled"
						className="h-9 w-full"
						loading={markReadyForInsurance.isPending}
						onClick={() => confirmAction(MARK_READY_FOR_INSURANCE_CONFIRM, onMarkReadyForInsurance)}
					>
						Mark for President&apos;s Review
					</Button>
					{canFleetManagerApproveInternally && approveInternallyButton()}
				</div>
			);
		}

		if (violation.status === SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW) {
			if (!violation.approvedForInsuranceAt) {
				return (
					<div className="mt-3 space-y-2">
						<div>
							<StageHeading>Pending President&apos;s Second review</StageHeading>
							<HintText>
								In President&apos;s queue. President have to review it before submitting for Insurance.
							</HintText>
						</div>
						<Button
							type="button"
							variant="outline"
							className="h-auto w-full whitespace-normal px-4 text-center"
							disabled
						>
							Waiting for President&apos;s Review...
						</Button>
						{canFleetManagerApproveInternally && approveInternallyButton()}
					</div>
				);
			}

			if (isFleetManager) {
				return (
					<div className="mt-3 space-y-2">
						<HintText>In your queue — review the email draft and take action.</HintText>
						<Button
							type="button"
							variant="filled"
							className="w-full"
							onClick={() => router.push(routes.admin.jobSiteSafetyViolationInsuranceEmailReview(id))}
						>
							Review Email Draft
						</Button>
						{approveInternallyButton(true)}
					</div>
				);
			}

			return (
				<div className="mt-3 space-y-2">
					<div>
						<StageHeading>Pending Fleet Manager&apos;s final review</StageHeading>
						<HintText>
							In Fleet Manager&apos;s queue. Fleet Manager have to review the email draft before it is sent.
						</HintText>
					</div>
					<Button
						type="button"
						variant="outline"
						className="h-auto w-full whitespace-normal px-4 py-3 text-center"
						disabled
					>
						Waiting for Fleet Manager&apos;s Review...
					</Button>
				</div>
			);
		}

		if (violation.status === SAFETY_REPORT_STATUS.SUBMITTED_TO_INSURANCE) {
			return <HintText>This claim has been sent to the insurer.</HintText>;
		}

		return <HintText>This report is being coordinated.</HintText>;
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-start">
					<SidebarBackButton />
					<div>
						<h2 className="text-2xl font-semibold text-brand-dark">
							{formatJobSiteSafetyReportNumber(
								JOB_SITE_SAFETY_VIOLATION_REPORT_PREFIX,
								violation.reportId,
								violation.createdAt
							)}
						</h2>
						<div className="mt-1 flex items-center gap-2">
							<span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-brand-red">
								Violation
							</span>
							{IS_VIOLATION_WORKFLOW_ENABLED && (
								<span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", statusMeta.className)}>
									{statusMeta.label}
								</span>
							)}
						</div>
					</div>
				</div>

				{showEditButton && (
					<Button
						type="button"
						variant="outline"
						className="h-9 rounded-[8px]"
						onClick={() =>
							router.push(
								`${routes.admin.jobSiteSafetyAddNewRecord}?tab=${ADD_RECORD_TAB.JOB_SITE_SAFETY_VIOLATION}&violationId=${id}`
							)
						}
					>
						Edit Report
					</Button>
				)}
			</div>

			<div className="flex flex-col gap-4 xl:flex-row">
				<div className="flex-1 space-y-4">
					<JobSiteSafetyViolationSummary violation={violation} />
				</div>

				{IS_VIOLATION_WORKFLOW_ENABLED && (
					<aside className="w-full shrink-0 space-y-4 xl:w-[300px]">
						<ReviewCard title="Approval Workflow">{renderApprovalStage()}</ReviewCard>

						<JobSiteSafetyLifecycle
							events={violation.lifecycleEvents}
							reportType={JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_SAFETY_VIOLATION}
						/>
					</aside>
				)}
			</div>

			<Modal />
		</div>
	);
};

export default JobSiteSafetyViolationReviewTemplate;
