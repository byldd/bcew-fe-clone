"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/auth-store";

import { JOB_SITE_SAFETY_REVIEWER_ROLE } from "@/module/admin-job-site-safety/enums";

import { IAccidentReviewDetail } from "../types";
import { INCIDENT_REPORT_STATUS } from "../utils/enums";
import { ReviewCard } from "./review-card";

const workflowButtonClass = "h-auto min-h-10 w-full !whitespace-normal break-words py-2 text-center leading-snug";

const HintText = ({ children }: { children: React.ReactNode }) => (
	<p className="my-4 text-sm text-brand-dark50">{children}</p>
);

const WorkflowHeader = ({ title, description }: { title: string; description: string }) => (
	<div className="space-y-1">
		<p className="text-sm font-medium text-brand-dark">{title}</p>
		<p className="text-sm text-brand-dark50">{description}</p>
	</div>
);

const AdminNoAction = () => <HintText>Admin will not be able to change the status now.</HintText>;

const AccidentApprovalWorkflow = ({
	report,
	isAssigning,
	isForwarding,
	hasAskedTechnician,
	isSendingToTechnician,
	isApprovingInternally,
	isResolving,
	onAssignToKevin,
	onForwardToNolan,
	onApproveInternally,
	onReviewEmailDraft,
	onSendToTechnician,
	onResolve,
	onClose,
}: {
	report: IAccidentReviewDetail;
	isAssigning: boolean;
	isForwarding: boolean;
	hasAskedTechnician: boolean;
	isSendingToTechnician: boolean;
	isApprovingInternally: boolean;
	isResolving: boolean;
	onAssignToKevin: () => void;
	onForwardToNolan: () => void;
	onApproveInternally: () => void;
	onReviewEmailDraft: () => void;
	onSendToTechnician: () => void;
	onResolve: () => void;
	onClose: () => void;
}) => {
	const { user } = useAuthStore((state) => state);
	const isPresident = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.PRESIDENT;
	const isFleetManager = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;

	const approveAndSendToInsuranceButton = (
		<Button
			type="button"
			variant="filled"
			className={workflowButtonClass}
			loading={isForwarding}
			onClick={onForwardToNolan}
		>
			Approve &amp; Send to Insurance
		</Button>
	);

	const resolveInternallyButton = (
		<Button
			type="button"
			variant="outline"
			className={workflowButtonClass}
			loading={isApprovingInternally}
			onClick={onApproveInternally}
		>
			Resolve Internally
		</Button>
	);

	const renderStage = () => {
		switch (report.status) {
			case INCIDENT_REPORT_STATUS.RESOLVED:
				return (
					<div className="space-y-4 pt-4">
						<HintText>Points applied, record closed.</HintText>
						<Button type="button" variant="outline" className={workflowButtonClass} onClick={onClose}>
							Close record
						</Button>
					</div>
				);

			case INCIDENT_REPORT_STATUS.REJECTED:
				return (
					<div className="space-y-4 pt-4">
						<HintText>This report was cancelled.</HintText>
						<Button type="button" variant="outline" className={workflowButtonClass} onClick={onClose}>
							Close record
						</Button>
					</div>
				);

			case INCIDENT_REPORT_STATUS.PENDING:
				if (hasAskedTechnician) {
					return (
						<div className="mt-3 space-y-4">
							<HintText>First-level approver reviews and marks the report ready.</HintText>
							<Button
								type="button"
								variant="filled"
								className={workflowButtonClass}
								loading={isSendingToTechnician}
								onClick={onSendToTechnician}
							>
								Send to Technician
							</Button>
						</div>
					);
				}

				return (
					<div className="mt-3 space-y-4">
						<HintText>First-level approver reviews and marks the report ready.</HintText>
						<div className="space-y-2">
							{isPresident ? (
								approveAndSendToInsuranceButton
							) : (
								<Button
									type="button"
									variant="filled"
									className={workflowButtonClass}
									loading={isAssigning}
									onClick={onAssignToKevin}
								>
									Mark for President&apos;s Review
								</Button>
							)}
							{(isPresident || isFleetManager) && resolveInternallyButton}
						</div>
					</div>
				);

			case INCIDENT_REPORT_STATUS.ADDITIONAL_INFO_REQUESTED:
				return (
					<div className="mt-3 space-y-4">
						<WorkflowHeader
							title="Waiting on technician"
							description="Sent back to the technician to complete the requested details. It returns for review once they resubmit."
						/>
						<Button type="button" variant="outline" className={workflowButtonClass} disabled>
							Awaiting technician&apos;s response...
						</Button>
					</div>
				);

			case INCIDENT_REPORT_STATUS.PENDING_SECOND_REVIEW:
				if (isPresident) {
					return (
						<div className="mt-3 space-y-4">
							<WorkflowHeader
								title="Pending second review"
								description="In your queue. Approving forwards the report to the Fleet Manager for the insurance email."
							/>
							<div className="space-y-2">
								{approveAndSendToInsuranceButton}
								{resolveInternallyButton}
							</div>
						</div>
					);
				}

				if (isFleetManager) {
					return (
						<div className="mt-3 space-y-4">
							<WorkflowHeader
								title="Pending President's review"
								description="In the President's queue for the insurance decision. You can still resolve it internally."
							/>
							{resolveInternallyButton}
						</div>
					);
				}

				return <AdminNoAction />;

			// The President has committed the report to the insurance path; it now waits with
			// the Fleet Manager for the email — still surfaced as "Pending Second Review".
			case INCIDENT_REPORT_STATUS.PENDING_THIRD_REVIEW:
				if (isFleetManager) {
					return (
						<div className="mt-3 space-y-4">
							<WorkflowHeader
								title="Review the insurance email"
								description="The President approved the claim. Review the email draft and send it to the insurer."
							/>
							<Button type="button" variant="filled" className={workflowButtonClass} onClick={onReviewEmailDraft}>
								Review Email Draft
							</Button>
						</div>
					);
				}

				return (
					<div className="mt-3 space-y-4">
						<WorkflowHeader
							title="With the Fleet Manager"
							description="The Fleet Manager will review the email draft and send the claim to the insurer."
						/>
						{!isPresident && <AdminNoAction />}
					</div>
				);

			case INCIDENT_REPORT_STATUS.WITH_INSURANCE:
				if (isPresident || isFleetManager) {
					return (
						<div className="mt-3 space-y-4">
							<div className="flex items-center justify-center gap-2 text-green-600">
								<CheckCircle2 className="h-5 w-5" />
								<p className="text-sm font-semibold">Email Sent Successfully</p>
							</div>
							<Button
								type="button"
								variant="filled"
								className={workflowButtonClass}
								loading={isResolving}
								onClick={onResolve}
							>
								Resolve
							</Button>
						</div>
					);
				}

				return <AdminNoAction />;

			default:
				return <HintText>This report is being coordinated.</HintText>;
		}
	};

	return <ReviewCard title="Approval Workflow">{renderStage()}</ReviewCard>;
};

export default AccidentApprovalWorkflow;
