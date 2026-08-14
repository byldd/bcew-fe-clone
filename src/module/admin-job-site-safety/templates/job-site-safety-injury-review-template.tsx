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
import { useActiveEmployees } from "../hooks/useAdminJobSiteInjury";
import {
	useApproveAndSendToInsurance,
	useApproveInternally,
	useJobSiteInjuryReportDetail,
	useMarkReadyForInsurance,
	useMarkResolved,
} from "../hooks/useJobSiteInjuryDetail";
import {
	APPROVE_AND_SEND_TO_INSURANCE_CONFIRM,
	APPROVE_INTERNALLY_CONFIRM,
	JOB_SITE_INJURY_REPORT_PREFIX,
	MARK_READY_FOR_INSURANCE_CONFIRM,
	resolveSafetyReportStatusMeta,
	formatJobSiteSafetyReportNumber,
} from "../utils/dashboard-constants";
import JobSiteInjuryReportSummary from "../components/job-site-injury-report-summary";

const HintText = ({ children }: { children: React.ReactNode }) => (
	<p className="my-3 text-sm text-brand-dark50">{children}</p>
);

const StageHeading = ({ children }: { children: React.ReactNode }) => (
	<p className="my-2 text-sm font-semibold text-brand-dark">{children}</p>
);

const CLOSED_STATUSES: SAFETY_REPORT_STATUS[] = [
	SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY,
	SAFETY_REPORT_STATUS.RESOLVED,
];

// Editing is only ever possible while the report is still moving through the
// President/Fleet Manager stages — once the insurance email has gone out
// (or the record is closed), the original data is frozen for good.
const EDITABLE_STATUSES: SAFETY_REPORT_STATUS[] = [
	SAFETY_REPORT_STATUS.PENDING,
	SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW,
];

interface JobSiteSafetyInjuryReviewTemplateProps {
	id: string;
}

const JobSiteSafetyInjuryReviewTemplate = ({ id }: JobSiteSafetyInjuryReviewTemplateProps) => {
	const router = useRouter();
	const { data: report, isLoading } = useJobSiteInjuryReportDetail(id);
	const { data: employees } = useActiveEmployees();
	const employee = employees?.find((candidate) => candidate.employeeId === report?.employeeId) ?? null;

	const markReadyForInsurance = useMarkReadyForInsurance();
	const approveInternally = useApproveInternally();
	const approveAndSendToInsurance = useApproveAndSendToInsurance();
	const markResolved = useMarkResolved();

	const { Modal, openModal, closeModal } = useModal();

	const { user } = useAuthStore((state) => state);
	const isPresident = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.PRESIDENT;
	const isFleetManager = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;

	if (isLoading || !report) {
		return (
			<div className="flex h-40 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	const statusMeta = resolveSafetyReportStatusMeta(report.status);
	// The President's insurance approval freezes the report — the Fleet Manager has
	// to review exactly what was approved.
	const showEditButton = EDITABLE_STATUSES.includes(report.status) && !report.approvedForInsuranceAt;

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

	// The President always gets both actions, regardless of stage, until the
	// report is closed (approved internally/resolved) or has already been
	// handed to the Fleet Manager for the email review (approvedForInsuranceAt
	// set) — after that only Fleet Manager can act.
	const canPresidentAct = isPresident && !report.approvedForInsuranceAt && !CLOSED_STATUSES.includes(report.status);
	// Before the President has approved a report for insurance, the Fleet
	// Specialist behaves like a normal admin plus this one extra permission.
	const canFleetManagerApproveInternally =
		isFleetManager && !report.approvedForInsuranceAt && !CLOSED_STATUSES.includes(report.status);
	const canMarkResolved =
		(isPresident || isFleetManager) && report.status === SAFETY_REPORT_STATUS.SUBMITTED_TO_INSURANCE;

	const approveInternallyButton = (disabled = false) => (
		<Button
			type="button"
			variant="outline"
			className="w-full"
			disabled={disabled}
			loading={approveInternally.isPending}
			onClick={() => confirmAction(APPROVE_INTERNALLY_CONFIRM, onApproveInternally)}
		>
			Approve Internally
		</Button>
	);

	const renderApprovalStage = () => {
		if (report.status === SAFETY_REPORT_STATUS.RESOLVED_INTERNALLY) {
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

		if (report.status === SAFETY_REPORT_STATUS.RESOLVED) {
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

		if (report.status === SAFETY_REPORT_STATUS.PENDING) {
			return (
				<div className="mt-3 space-y-2">
					<HintText>First-level approver reviews and marks the report ready.</HintText>
					<Button
						type="button"
						variant="filled"
						className="w-full"
						loading={markReadyForInsurance.isPending}
						onClick={() => confirmAction(MARK_READY_FOR_INSURANCE_CONFIRM, onMarkReadyForInsurance)}
					>
						Mark for President&apos;s Review
					</Button>
					{canFleetManagerApproveInternally && approveInternallyButton()}
				</div>
			);
		}

		if (report.status === SAFETY_REPORT_STATUS.PENDING_SECOND_REVIEW) {
			if (!report.approvedForInsuranceAt) {
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
							onClick={() => router.push(routes.admin.jobSiteSafetyInsuranceEmailReview(id))}
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
							In Fleet Manager&apos;s queue. Fleet Manager have to review the email draft and take action.
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

		if (report.status === SAFETY_REPORT_STATUS.SUBMITTED_TO_INSURANCE) {
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
							{formatJobSiteSafetyReportNumber(JOB_SITE_INJURY_REPORT_PREFIX, report.reportId, report.createdAt)}
						</h2>
						<div className="mt-1 flex items-center gap-2">
							<span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-brand-red">
								Injury
							</span>
							<span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", statusMeta.className)}>
								{statusMeta.label}
							</span>
						</div>
					</div>
				</div>

				{showEditButton && (
					<Button
						type="button"
						variant="outline"
						onClick={() =>
							router.push(
								`${routes.admin.jobSiteSafetyAddNewRecord}?tab=${ADD_RECORD_TAB.JOB_SITE_INJURY}&draftId=${id}`
							)
						}
					>
						Edit Report
					</Button>
				)}
			</div>

			<div className="flex flex-col items-start gap-4 xl:flex-row">
				<div className="flex w-full flex-col gap-4 overflow-hidden xl:sticky xl:top-4 xl:max-h-[calc(100svh-8rem)] xl:flex-1">
					{/* One scrollable box instead of five stacked cards. Sticky + the same max-height as the
					    aside on the right, so this column matches it exactly instead of letting the page scroll past. */}
					<div className="min-h-0 flex-1 divide-y divide-brand-dark10 overflow-y-auto rounded-[12px] bg-white shadow-md">
						<JobSiteInjuryReportSummary
							report={report}
							employee={employee}
							cardClassName="rounded-none bg-transparent shadow-none"
						/>
					</div>
				</div>

				<aside className="flex w-full shrink-0 flex-col gap-4 xl:sticky xl:top-4 xl:max-h-[calc(100svh-8rem)] xl:w-[300px]">
					<div className="shrink-0">
						<ReviewCard title="Approval Workflow">{renderApprovalStage()}</ReviewCard>
					</div>
					<div className="flex min-h-0 w-full flex-col xl:flex-1">
						<JobSiteSafetyLifecycle
							events={report.lifecycleEvents}
							reportType={JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_INJURY}
						/>
					</div>
				</aside>
			</div>

			<Modal />
		</div>
	);
};

export default JobSiteSafetyInjuryReviewTemplate;
