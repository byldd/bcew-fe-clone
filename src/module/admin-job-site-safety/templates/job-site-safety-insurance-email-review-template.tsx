"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { ReviewCard } from "@/module/driving-safety/incident-reports/components/review-card";
import { SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import useAuthStore from "@/store/auth-store";
import { JOB_SITE_SAFETY_REVIEWER_ROLE } from "../enums";
import { IJobSiteSafetyEmailDraft } from "../types";
import { useActiveEmployees } from "../hooks/useAdminJobSiteInjury";
import { useJobSiteInjuryReportDetail, useSendInsuranceEmail } from "../hooks/useJobSiteInjuryDetail";
import { EMPTY_EMAIL_DRAFT, buildInjuryEmailDraft } from "../utils/insurance-email";
import JobSiteInjuryReportSummary from "../components/job-site-injury-report-summary";
import JobSiteSafetyEmailPreview from "../components/job-site-safety-email-preview";

interface JobSiteSafetyInsuranceEmailReviewTemplateProps {
	id: string;
}

const JobSiteSafetyInsuranceEmailReviewTemplate = ({ id }: JobSiteSafetyInsuranceEmailReviewTemplateProps) => {
	const router = useRouter();
	const { data: report, isLoading } = useJobSiteInjuryReportDetail(id);
	const { data: employees } = useActiveEmployees();
	const employee = employees?.find((candidate) => candidate.employeeId === report?.employeeId) ?? null;

	const sendInsuranceEmail = useSendInsuranceEmail();

	const { user } = useAuthStore((state) => state);
	const isFleetManager = user?.role?.name === JOB_SITE_SAFETY_REVIEWER_ROLE.FLEET_MANAGER;

	const form = useForm<IJobSiteSafetyEmailDraft>({ defaultValues: EMPTY_EMAIL_DRAFT });
	// Seeded once per record — the employee name arrives on its own query, so the
	// subject is rebuilt when it lands, but nothing re-seeds after that or a
	// background refetch would discard what the Fleet Manager had typed.
	const seededKey = useRef<string | null>(null);
	useEffect(() => {
		if (!report) return;
		const key = `${report.id}|${employee?.employeeId ?? ""}`;
		if (seededKey.current === key) return;
		seededKey.current = key;
		form.reset(buildInjuryEmailDraft(report, employee));
	}, [report, employee, form]);

	if (isLoading || !report) {
		return (
			<div className="flex h-40 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	const isSent = report.status === SAFETY_REPORT_STATUS.SUBMITTED_TO_INSURANCE;

	const onApproveAndSendEmail = async () => {
		try {
			await sendInsuranceEmail.mutateAsync({ id, emailContent: form.getValues() });
			openSuccessToast("Insurance email sent");
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	const renderSidebar = () => {
		if (isSent) {
			return (
				<>
					<p className="mb-3 flex items-center gap-2 text-sm font-medium text-green-600">
						<CheckCircle2 size={16} /> Email Sent
					</p>
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={() => router.push(routes.admin.jobSiteSafetyDashboard)}
					>
						Back to Dashboard
					</Button>
					<p className="mt-2 text-center text-xs text-brand-dark50">Email sent successfully.</p>
				</>
			);
		}

		if (isFleetManager && report.approvedForInsuranceAt) {
			return (
				<>
					<Button
						type="button"
						variant="filled"
						className="w-full"
						loading={sendInsuranceEmail.isPending}
						onClick={onApproveAndSendEmail}
					>
						Approve &amp; Send Email
					</Button>
					<p className="mt-2 text-xs text-brand-dark50">Approving will send the email directly to Insurance Company.</p>
				</>
			);
		}

		return <p className="text-sm text-brand-dark50">Pending Fleet Manager&apos;s action.</p>;
	};

	return (
		<div className="space-y-4">
			<div className="ml-[-10px] flex items-center gap-1">
				<BackButton />
				<h2 className="text-2xl font-semibold text-brand-dark">Insurance Email Review</h2>
			</div>

			<div className="flex flex-col gap-4 xl:flex-row">
				<div className="flex-1 space-y-4">
					<JobSiteSafetyEmailPreview form={form} disabled={isSent}>
						<JobSiteInjuryReportSummary report={report} employee={employee} />
					</JobSiteSafetyEmailPreview>
				</div>

				<aside className="w-full shrink-0 xl:w-[300px]">
					<ReviewCard title="Approval Workflow">{renderSidebar()}</ReviewCard>
				</aside>
			</div>
		</div>
	);
};

export default JobSiteSafetyInsuranceEmailReviewTemplate;
