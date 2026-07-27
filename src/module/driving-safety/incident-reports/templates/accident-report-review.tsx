"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { routes } from "@/config/routes";
import { useHandleFileUpload } from "@/hooks/useFile";
import { useDrivingSafetyPolicies } from "@/module/driving-safety/policies/hooks/useDrivingSafetyPolicies";

import AccidentApprovalWorkflow from "../components/accident-approval-workflow";
import AccidentDocuments from "../components/accident-documents";
import AccidentMedicalCard from "../components/accident-medical-card";
import AccidentOtherVehicleCard from "../components/accident-other-vehicle-card";
import AccidentReportSummary from "../components/accident-report-summary";
import AccidentReviewHeader from "../components/accident-review-header";
import AccidentTowImpoundCard from "../components/accident-tow-impound-card";
import AccidentViolationAssessment from "../components/accident-violation-assessment";
import { useAccidentReportDetail, useApproveAccidentReport } from "../hooks/useAccidentReport";
import { INCIDENT_REPORT_STATUS } from "../utils/enums";
import {
	buildAccidentReviewDefaults,
	buildApprovePayload,
	collectReviewDocuments,
} from "../utils/accident-review-payload";
import { accidentReviewSchema, IAccidentReviewSchema } from "../utils/accident-review-schema";

const CLOSED_STATUSES = [INCIDENT_REPORT_STATUS.RESOLVED, INCIDENT_REPORT_STATUS.REJECTED];

const AccidentReportReview = ({ reportId }: { reportId: string }) => {
	const router = useRouter();
	const { data: report, isLoading, isError } = useAccidentReportDetail(reportId);
	const { data: policies } = useDrivingSafetyPolicies();
	const approveReport = useApproveAccidentReport(reportId);
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const form = useForm<IAccidentReviewSchema>({
		resolver: zodResolver(accidentReviewSchema),
		defaultValues: {
			violationTypeId: "",
			overrideReason: "",
			repairEstimate: [],
			insuranceCorrespondence: [],
		},
	});

	useEffect(() => {
		if (!report) return;
		form.reset(buildAccidentReviewDefaults(report));
	}, [report, form]);

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

	const isClosed = CLOSED_STATUSES.includes(report.status);
	const goToList = () => router.push(routes.admin.drivingSafetyIncidentReports);

	const onSubmit = async (values: IAccidentReviewSchema) => {
		try {
			const filesToUpload = getFilesToUpload(collectReviewDocuments(values));
			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
			}

			await approveReport.mutateAsync(buildApprovePayload(values));
			openSuccessToast("Accident report approved");
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<AccidentReviewHeader report={report} />

				<div className="flex flex-col gap-4 xl:flex-row">
					<div className="flex-1 space-y-4">
						<AccidentReportSummary report={report} />
						{report.otherVehicle && <AccidentOtherVehicleCard otherVehicle={report.otherVehicle} />}
						<AccidentTowImpoundCard report={report} />
						<AccidentMedicalCard report={report} />
						<AccidentViolationAssessment
							form={form}
							violationTypes={policies?.violationTypes ?? []}
							savedType={report.violationType ?? null}
							savedPoints={report.pointsApplied}
							disabled={isClosed}
						/>
						<AccidentDocuments form={form} report={report} disabled={isClosed} />

						{!isClosed && (
							<div className="flex items-center justify-between gap-3">
								<Button type="submit" variant="outline" loading={approveReport.isPending}>
									Approve Internally (minor)
								</Button>
								{/* Insurance hand-off lands in a follow-up. */}
								<Button type="button" variant="filled" disabled>
									Mark Ready for Insurance
								</Button>
							</div>
						)}
					</div>

					<aside className="w-full shrink-0 xl:w-[300px]">
						<AccidentApprovalWorkflow isClosed={isClosed} isApproving={approveReport.isPending} onClose={goToList} />
					</aside>
				</div>
			</form>
		</Form>
	);
};

export default AccidentReportReview;
