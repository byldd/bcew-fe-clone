"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import ConfirmModal from "@/components/confirm-modal";
import { useModal } from "@/hooks/useModal";
import { routes } from "@/config/routes";
import useAuthStore from "@/store/auth-store";
import { useHandleFileUpload } from "@/hooks/useFile";
import { ACCIDENT_SECTION, YES_NO } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_REVIEWER_ROLE } from "@/module/admin-job-site-safety/enums";
import { useDrivingSafetyPolicies } from "@/module/driving-safety/policies/hooks/useDrivingSafetyPolicies";

import AccidentAdminInputs from "../components/accident-admin-inputs";
import AccidentApprovalWorkflow from "../components/accident-approval-workflow";
import AccidentAuditTrail from "../components/accident-audit-trail";
import AccidentDocuments from "../components/accident-documents";
import AccidentReviewHeader from "../components/accident-review-header";
import AccidentTechnicianInfo from "../components/accident-technician-info";
import AccidentViolationAssessment from "../components/accident-violation-assessment";
import {
	useAccidentReportDetail,
	useApproveAccidentReport,
	useAssignSecondReview,
	useRequestTechnicianInfo,
	useResolveInsuranceClaim,
	useSecondReview,
} from "../hooks/useAccidentReport";
import { IAccidentReviewDetail } from "../types";
import { INCIDENT_REPORT_STATUS, SECOND_REVIEW_ACTION, VIOLATION_TYPE_CATEGORY } from "../utils/enums";
import {
	buildAccidentReviewDefaults,
	buildApprovePayload,
	buildAssignPayload,
	collectReviewDocuments,
} from "../utils/accident-review-payload";
import { accidentReviewSchema, IAccidentReviewSchema } from "../utils/accident-review-schema";
import {
	APPROVE_AND_SEND_TO_INSURANCE_CONFIRM,
	APPROVE_INTERNALLY_CONFIRM,
	IConfirmActionCopy,
	MARK_AS_RESOLVED_CONFIRM,
	MARK_FOR_PRESIDENT_REVIEW_CONFIRM,
	SEND_TO_TECHNICIAN_CONFIRM,
} from "../utils/constants";

const CLOSED_STATUSES = [INCIDENT_REPORT_STATUS.RESOLVED, INCIDENT_REPORT_STATUS.REJECTED];

const AccidentReportReview = ({ reportId }: { reportId: string }) => {
	const { data: report, isLoading, isError } = useAccidentReportDetail(reportId);

	if (isLoading) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError || !report) {
		return <p className="py-10 text-center text-sm text-brand-red">Unable to load the accident report.</p>;
	}

	return <AccidentReportReviewForm report={report} reportId={reportId} />;
};

const AccidentReportReviewForm = ({ report, reportId }: { report: IAccidentReviewDetail; reportId: string }) => {
	const router = useRouter();
	const { user } = useAuthStore((state) => state);
	const { data: policies } = useDrivingSafetyPolicies();
	const approveReport = useApproveAccidentReport(reportId);
	const assignReport = useAssignSecondReview(reportId);
	const requestInfo = useRequestTechnicianInfo(reportId);
	const secondReview = useSecondReview(reportId);
	const resolveClaim = useResolveInsuranceClaim(reportId);
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const { Modal, openModal, closeModal } = useModal();

	const form = useForm<IAccidentReviewSchema>({
		resolver: zodResolver(accidentReviewSchema),
		defaultValues: buildAccidentReviewDefaults(report),
	});

	// Keep the form in sync when the report refetches (e.g. after a workflow action).
	useEffect(() => {
		form.reset(buildAccidentReviewDefaults(report));
	}, [report, form]);

	// A drug screen is required whenever another vehicle, a person, or an object/property
	// was struck. Default it to Yes when the admin hasn't answered; a manual choice sticks.
	const objectStruck = !!(
		report.propertyDamage &&
		(report.propertyDamage.anotherCompanyProperty ||
			report.propertyDamage.builderProperty ||
			report.propertyDamage.homeownerProperty)
	);
	const drugScreenTriggered = report.anotherVehicleInvolved || report.personStruck || objectStruck;
	const drugScreenNeeded = useWatch({ control: form.control, name: "drugScreenNeeded" });
	useEffect(() => {
		if (drugScreenTriggered && !drugScreenNeeded) {
			form.setValue("drugScreenNeeded", YES_NO.YES);
		}
	}, [drugScreenTriggered, drugScreenNeeded, form]);

	// Admin can flag the Tow & Impound section to be completed by the technician; while
	// flagged, the report is sent back instead of escalated to the President.
	const [askTowFromTechnician, setAskTowFromTechnician] = useState(false);

	const isClosed = CLOSED_STATUSES.includes(report.status);
	const isSecondReviewer = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.PRESIDENT;
	const isThirdReviewer = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;

	const canEdit =
		!isClosed &&
		(report.status === INCIDENT_REPORT_STATUS.PENDING ||
			(report.status === INCIDENT_REPORT_STATUS.PENDING_SECOND_REVIEW && isSecondReviewer) ||
			(report.status === INCIDENT_REPORT_STATUS.PENDING_THIRD_REVIEW && isThirdReviewer));

	const disabled = !canEdit;
	const canAskTechnician = report.status === INCIDENT_REPORT_STATUS.PENDING;

	const accidentViolationTypes = (policies?.violationTypes ?? []).filter((violationType) =>
		violationType.categories.includes(VIOLATION_TYPE_CATEGORY.ACCIDENT_VIOLATION)
	);
	const goToList = () => router.push(routes.admin.drivingSafetyIncidentReports);

	const uploadPendingDocuments = async (values: IAccidentReviewSchema) => {
		const filesToUpload = getFilesToUpload(collectReviewDocuments(values));
		if (filesToUpload.length) {
			const signedUrls = await getSignedUrls(filesToUpload);
			await handleFileUpload({ signedUrls, filesToUpload });
		}
	};

	const onSubmit = async (values: IAccidentReviewSchema) => {
		try {
			await uploadPendingDocuments(values);
			await approveReport.mutateAsync(buildApprovePayload(values));
			openSuccessToast("Accident report approved");
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const handleAssignToKevin = async () => {
		const values = form.getValues();
		try {
			await uploadPendingDocuments(values);
			await assignReport.mutateAsync(buildAssignPayload(values));
			openSuccessToast("Sent for President's review");
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const handleSendToTechnician = async () => {
		const values = form.getValues();
		try {
			await uploadPendingDocuments(values);
			await requestInfo.mutateAsync({
				requestedSections: [ACCIDENT_SECTION.TOW_IMPOUND],
				...buildAssignPayload(values),
			});
			setAskTowFromTechnician(false);
			openSuccessToast("Sent to technician");
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const handleForwardToNolan = async () => {
		const values = form.getValues();
		try {
			await uploadPendingDocuments(values);
			await secondReview.mutateAsync({
				action: SECOND_REVIEW_ACTION.APPROVE,
				...buildAssignPayload(values),
			});
			openSuccessToast("Forwarded for Fleet Manager's review");
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const handleApproveInternally = async () => {
		const values = form.getValues();
		try {
			await uploadPendingDocuments(values);
			if (report.status === INCIDENT_REPORT_STATUS.PENDING) {
				await approveReport.mutateAsync(buildApprovePayload(values));
			} else {
				await secondReview.mutateAsync({
					action: SECOND_REVIEW_ACTION.APPROVE_INTERNALLY,
					...buildAssignPayload(values),
				});
			}
			openSuccessToast("Report approved internally");
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const handleResolve = async () => {
		try {
			await resolveClaim.mutateAsync();
			openSuccessToast("Claim marked as resolved");
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const handleReviewEmailDraft = () => router.push(routes.admin.drivingSafetyInsuranceEmailReview(reportId));

	// Every workflow action hands the report off irreversibly, so it runs through a
	// confirmation popup rather than firing on the first click.
	const confirmAction = ({ title, description, confirmText }: IConfirmActionCopy, action: () => void) =>
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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<AccidentReviewHeader report={report} />

				<div className="flex flex-col items-start gap-4 xl:flex-row">
					<div className="flex w-full flex-col gap-4 overflow-hidden xl:sticky xl:top-4 xl:max-h-[calc(100svh-8rem)] xl:flex-1">
						{/* One scrollable box instead of four stacked cards. Sticky + the same max-height as the
						    aside on the right, so this column matches it exactly instead of letting the page scroll past. */}
						<div className="min-h-0 flex-1 divide-y divide-brand-dark10 overflow-y-auto rounded-[12px] bg-white shadow-md">
							<AccidentTechnicianInfo
								report={report}
								canEdit={report.status === INCIDENT_REPORT_STATUS.PENDING}
								className="rounded-none bg-transparent shadow-none"
							/>
							<AccidentDocuments
								form={form}
								report={report}
								disabled={disabled}
								className="rounded-none bg-transparent shadow-none"
							/>
							<AccidentAdminInputs
								form={form}
								disabled={disabled}
								anotherVehicleInvolved={report.anotherVehicleInvolved}
								personStruck={report.personStruck}
								objectStruck={objectStruck}
								showAskTow={canAskTechnician}
								isTowAsked={askTowFromTechnician}
								onToggleAskTow={() => setAskTowFromTechnician((asked) => !asked)}
								className="rounded-none bg-transparent shadow-none"
							/>
							<AccidentViolationAssessment
								form={form}
								violationTypes={accidentViolationTypes}
								savedType={report.violationType ?? null}
								savedPoints={report.pointsApplied}
								disabled={disabled}
								className="rounded-none bg-transparent shadow-none"
							/>
						</div>
					</div>

					<aside className="flex w-full shrink-0 flex-col gap-4 xl:sticky xl:top-4 xl:max-h-[calc(100svh-8rem)] xl:w-[300px]">
						<div className="shrink-0">
							<AccidentApprovalWorkflow
								report={report}
								isAssigning={assignReport.isPending}
								isForwarding={secondReview.isPending && secondReview.variables?.action === SECOND_REVIEW_ACTION.APPROVE}
								isApprovingInternally={
									approveReport.isPending ||
									(secondReview.isPending && secondReview.variables?.action === SECOND_REVIEW_ACTION.APPROVE_INTERNALLY)
								}
								isResolving={resolveClaim.isPending}
								hasAskedTechnician={askTowFromTechnician}
								isSendingToTechnician={requestInfo.isPending}
								onAssignToKevin={() => confirmAction(MARK_FOR_PRESIDENT_REVIEW_CONFIRM, handleAssignToKevin)}
								onForwardToNolan={() => confirmAction(APPROVE_AND_SEND_TO_INSURANCE_CONFIRM, handleForwardToNolan)}
								onApproveInternally={() => confirmAction(APPROVE_INTERNALLY_CONFIRM, handleApproveInternally)}
								onSendToTechnician={() => confirmAction(SEND_TO_TECHNICIAN_CONFIRM, handleSendToTechnician)}
								onReviewEmailDraft={handleReviewEmailDraft}
								onResolve={() => confirmAction(MARK_AS_RESOLVED_CONFIRM, handleResolve)}
								onClose={goToList}
							/>
						</div>
						<div className="flex min-h-0 w-full flex-col xl:flex-1">
							<AccidentAuditTrail reportId={reportId} status={report.status} />
						</div>
					</aside>
				</div>
			</form>
			<Modal />
		</Form>
	);
};

export default AccidentReportReview;
