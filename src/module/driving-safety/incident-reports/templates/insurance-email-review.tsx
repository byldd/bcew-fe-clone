"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";

import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { openErrorToast } from "@/components/toast";
import ConfirmModal from "@/components/confirm-modal";
import { useModal } from "@/hooks/useModal";
import { routes } from "@/config/routes";
import { useHandleFileUpload } from "@/hooks/useFile";

import RequestDocuments from "../components/request-documents";
import { ReviewCard } from "../components/review-card";
import {
	useAccidentReportDetail,
	useInsuranceEmailDraft,
	useResolveInsuranceClaim,
	useThirdReview,
} from "../hooks/useAccidentReport";
import { APPROVE_AND_SEND_EMAIL_CONFIRM, MARK_AS_RESOLVED_CONFIRM } from "../utils/constants";
import { THIRD_REVIEW_ACTION } from "../utils/enums";
import {
	buildAccidentReviewDefaults,
	buildAssignPayload,
	collectReviewDocuments,
} from "../utils/accident-review-payload";
import { IAccidentReviewSchema } from "../utils/accident-review-schema";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

const EmailField = ({
	label,
	disabled,
	registration,
}: {
	label: string;
	disabled: boolean;
	registration: UseFormRegisterReturn;
}) => (
	<div className="flex items-center gap-3">
		<label className="w-16 shrink-0 text-sm text-brand-dark50">{label}</label>
		<Input disabled={disabled} className="flex-1" {...registration} />
	</div>
);

const InsuranceEmailReview = ({ reportId }: { reportId: string }) => {
	const router = useRouter();
	const { data: report, isLoading, isError } = useAccidentReportDetail(reportId);
	const { data: draft } = useInsuranceEmailDraft(reportId);
	const thirdReview = useThirdReview(reportId);
	const resolveClaim = useResolveInsuranceClaim(reportId);
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const { Modal, openModal, closeModal } = useModal();

	const [emailSent, setEmailSent] = useState(false);
	const [resolved, setResolved] = useState(false);

	const form = useForm<IAccidentReviewSchema>({
		resolver: undefined,
		defaultValues: {
			violationTypeId: "",
			overrideReason: "",
			repairEstimate: [],
			insuranceCorrespondence: [],
			emailFrom: "",
			emailTo: "",
			emailCc: "",
			emailSubject: "",
			emailIntro: "",
			emailClosing: "",
		},
	});

	useEffect(() => {
		if (!report) return;
		form.reset(buildAccidentReviewDefaults(report));
	}, [report, form]);

	useEffect(() => {
		if (!draft) return;
		form.setValue("emailFrom", draft.from);
		form.setValue("emailTo", draft.to);
		form.setValue("emailCc", draft.cc);
		form.setValue("emailSubject", draft.subject);
		form.setValue("emailIntro", draft.intro);
		form.setValue("emailClosing", draft.closing);
	}, [draft, form]);

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

	const handleApproveAndSend = async () => {
		const values = form.getValues();
		try {
			const filesToUpload = getFilesToUpload(collectReviewDocuments(values));
			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
			}
			await thirdReview.mutateAsync({
				action: THIRD_REVIEW_ACTION.SEND_TO_INSURANCE,
				...buildAssignPayload(values),
				emailContent: { intro: values.emailIntro ?? "", closing: values.emailClosing ?? "" },
			});
			setEmailSent(true);
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const confirmApproveAndSend = () =>
		openModal({
			modalTitle: APPROVE_AND_SEND_EMAIL_CONFIRM.title,
			headerClassName: "border-b border-brand-dark10 pb-3",
			modalView: (
				<ConfirmModal
					description={
						<span className="mt-3 block text-sm leading-relaxed text-brand-dark50">
							{APPROVE_AND_SEND_EMAIL_CONFIRM.description}
						</span>
					}
					confirmText={APPROVE_AND_SEND_EMAIL_CONFIRM.confirmText}
					onConfirm={() => {
						closeModal();
						handleApproveAndSend();
					}}
					onCancel={closeModal}
				/>
			),
		});

	const handleResolve = async () => {
		try {
			await resolveClaim.mutateAsync();
			setResolved(true);
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	const confirmResolve = () =>
		openModal({
			modalTitle: MARK_AS_RESOLVED_CONFIRM.title,
			modalView: (
				<ConfirmModal
					description={MARK_AS_RESOLVED_CONFIRM.description}
					confirmText={MARK_AS_RESOLVED_CONFIRM.confirmText}
					onConfirm={() => {
						closeModal();
						handleResolve();
					}}
					onCancel={closeModal}
				/>
			),
		});

	return (
		<Form {...form}>
			<div className="space-y-4">
				<div className="ml-[-10px] flex items-center gap-1">
					<BackButton />
					<h2 className="text-2xl font-semibold text-brand-dark">Insurance Email Review</h2>
				</div>

				<div className="flex flex-col gap-4 pb-4 xl:max-h-[calc(100vh-7rem)] xl:flex-row">
					<div className="flex-1 space-y-4 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
						<ReviewCard>
							<div className="mb-3">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark50">Email Preview</h3>
							</div>

							{draft ? (
								<>
									<div className="space-y-3">
										<EmailField label="From" registration={form.register("emailFrom")} disabled={emailSent} />
										<EmailField label="To" registration={form.register("emailTo")} disabled={emailSent} />
										<EmailField label="Cc" registration={form.register("emailCc")} disabled={emailSent} />
										<EmailField label="Subject" registration={form.register("emailSubject")} disabled={emailSent} />
									</div>
									<div className="mt-4 space-y-3 border-t border-brand-dark10 pt-4">
										<Textarea
											rows={3}
											disabled={emailSent}
											className="text-sm leading-relaxed"
											{...form.register("emailIntro")}
										/>
										<div
											className="text-sm leading-relaxed text-brand-dark [&_h4]:font-semibold [&_li]:my-0.5"
											dangerouslySetInnerHTML={{ __html: draft.bodyHtml }}
										/>
										<Textarea
											rows={2}
											disabled={emailSent}
											className="text-sm leading-relaxed"
											{...form.register("emailClosing")}
										/>
									</div>
									<div
										className="mt-4 border-t border-brand-dark10 text-sm leading-relaxed text-brand-dark [&_h4]:font-semibold [&_li]:my-0.5"
										dangerouslySetInnerHTML={{ __html: draft.bodyHtml }}
									/>
								</>
							) : (
								<div className="flex h-40 items-center justify-center">
									<Spinner />
								</div>
							)}
						</ReviewCard>

						<RequestDocuments report={report} />
					</div>

					<aside className="w-full shrink-0 xl:w-[320px] xl:self-start">
						<ReviewCard>
							{resolved ? (
								<div className="space-y-3 text-center">
									<div className="flex items-center justify-center gap-2 text-green-600">
										<CheckCircle2 className="h-5 w-5" />
										<p className="text-sm font-semibold">Claim Resolved</p>
									</div>
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() => router.push(routes.admin.drivingSafetyDashboard)}
									>
										Back to Dashboard
									</Button>
								</div>
							) : emailSent ? (
								<div className="space-y-3 text-center">
									<div className="flex items-center justify-center gap-2 text-green-600">
										<CheckCircle2 className="h-5 w-5" />
										<p className="text-sm font-semibold">Email Sent Successfully</p>
									</div>
									<Button
										type="button"
										variant="filled"
										className="w-full"
										loading={resolveClaim.isPending}
										onClick={confirmResolve}
									>
										Resolve
									</Button>
								</div>
							) : (
								<WriteAccessWrapper>
									<div className="space-y-3">
										<Button
											type="button"
											variant="filled"
											className="w-full"
											loading={thirdReview.isPending}
											onClick={confirmApproveAndSend}
										>
											Approve &amp; Send Email
										</Button>
										<p className="text-xs text-brand-dark50">
											<span className="font-medium text-brand-dark">Approving</span> will send the email directly to
											Insurance Company.
										</p>
									</div>
								</WriteAccessWrapper>
							)}
						</ReviewCard>
					</aside>
				</div>
			</div>
			<Modal />
		</Form>
	);
};

export default InsuranceEmailReview;
