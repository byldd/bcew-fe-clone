"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import SidebarBackButton from "@/components/common/sidebar-back-button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { useBreakdownReportDetail, useUpdateBreakdownReport } from "../hooks/useBreakdownReport";
import { IBreakdownReportDetail } from "../types";
import { BREAKDOWN_REPORT_PREFIX, formatReportNumber } from "../utils/constants";
import { bcewVehicleTowedField, costOnSpotField } from "../utils/breakdown-review-fields";
import { breakdownReviewSchema, IBreakdownReviewSchema } from "../utils/breakdown-review-schema";
import BreakdownKeyResources from "../components/breakdown-key-resources";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

const SectionTitle = ({ children }: { children: string }) => (
	<h3 className="text-xs font-semibold text-brand-dark50">{children}</h3>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<div className="flex items-start justify-between gap-4 text-sm">
		<span className="text-brand-dark50">{label}</span>
		<span className="max-w-[60%] text-right font-medium text-brand-dark">{value}</span>
	</div>
);

const BreakdownReviewPage = ({ detail }: { detail: IBreakdownReportDetail }) => {
	const [isEditing, setIsEditing] = useState(false);
	const updateReport = useUpdateBreakdownReport(detail.id);

	const defaultValues: IBreakdownReviewSchema = {
		bcewVehicleTowed: detail.bcewVehicleTowed,
		costOnSpot: detail.costOnSpot ?? "",
	};

	const form = useForm<IBreakdownReviewSchema>({
		resolver: zodResolver(breakdownReviewSchema),
		defaultValues,
	});

	const isTowed = useWatch({ control: form.control, name: "bcewVehicleTowed" }) === true;
	const costValue = useWatch({ control: form.control, name: "costOnSpot" });

	// Cost only applies when the vehicle was towed — drop any stale value once it's toggled off.
	useEffect(() => {
		if (!isTowed) form.setValue("costOnSpot", "");
	}, [isTowed, form]);

	const canSave = isTowed ? Number(costValue) > 0 : true;

	const cancelEdit = () => {
		form.reset(defaultValues);
		setIsEditing(false);
	};

	const onSubmit = (values: IBreakdownReviewSchema) => {
		updateReport.mutate(
			{
				bcewVehicleTowed: values.bcewVehicleTowed,
				costOnSpot: values.costOnSpot.trim() === "" ? null : Number(values.costOnSpot),
			},
			{
				onSuccess: () => {
					openSuccessToast("Breakdown report updated");
					setIsEditing(false);
				},
				onError: (error) => openErrorToast({ error: error as AxiosError<{ message: string }> }),
			}
		);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center">
						<SidebarBackButton />
						<h2 className="text-2xl font-semibold text-brand-dark">Vehicle Breakdown Report</h2>
					</div>
					<WriteAccessWrapper>
						<Button type="button" variant="outline" disabled={isEditing} onClick={() => setIsEditing(true)}>
							Edit Report
						</Button>
					</WriteAccessWrapper>
				</div>

				<div className="flex flex-col items-start gap-4 xl:flex-row">
					<div className="w-full flex-1 space-y-6 rounded-[12px] bg-white p-5 shadow-md">
						<div className="space-y-3">
							<SectionTitle>Basic Information</SectionTitle>
							<div className="space-y-2.5">
								<InfoRow
									label="Request #"
									value={formatReportNumber(BREAKDOWN_REPORT_PREFIX, detail.reportId, detail.createdAt)}
								/>
								<InfoRow label="Truck #" value={detail.truckNumber ?? "--"} />
								<InfoRow label="Issue Category" value={detail.issueCategory?.name ?? "--"} />
								<InfoRow label="Issue Type" value={detail.issueType?.name ?? "--"} />
								<InfoRow label="Reported by" value={detail.user?.name ?? "--"} />
								<InfoRow label="Submitted" value={toLocalFormattedDate(detail.createdAt, DATE_FORMAT.DATE_AND_TIME)} />
								<InfoRow label="Description" value={detail.description ?? "--"} />
							</div>
						</div>

						<div className="space-y-3 border-t border-brand-dark10 pt-4">
							<SectionTitle>Towing Information</SectionTitle>
							{isEditing ? (
								<div className="space-y-2">
									<FormInputWrapper form={form} fieldConfig={bcewVehicleTowedField} wrapperClassName="py-1" />
									{isTowed && <FormInputWrapper form={form} fieldConfig={costOnSpotField} />}
								</div>
							) : (
								<div className="space-y-2.5">
									<InfoRow label="Was the BCEW vehicle towed?" value={detail.bcewVehicleTowed ? "Yes" : "No"} />
									{detail.bcewVehicleTowed && (
										<InfoRow
											label="Cost (if paid on the spot)"
											value={detail.costOnSpot ? `$${detail.costOnSpot}` : "--"}
										/>
									)}
								</div>
							)}
						</div>
					</div>

					<aside className="flex w-full shrink-0 flex-col gap-4 xl:w-[300px]">
						<WriteAccessWrapper>
							<div className="flex flex-col gap-3 rounded-[12px] bg-white p-4 shadow-md">
								<Button type="button" variant="outline" className="w-full" disabled={!isEditing} onClick={cancelEdit}>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="filled"
									className="w-full"
									disabled={!isEditing || !canSave}
									loading={updateReport.isPending}
								>
									Save Changes
								</Button>
							</div>
						</WriteAccessWrapper>
						<div className="rounded-[12px] bg-white p-4 shadow-md">
							<BreakdownKeyResources />
						</div>
					</aside>
				</div>
			</form>
		</Form>
	);
};

const BreakdownReportReview = ({ reportId }: { reportId: string }) => {
	const { data: detail, isLoading, isError } = useBreakdownReportDetail(reportId);

	if (isLoading) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError || !detail) {
		return <p className="py-10 text-center text-sm text-brand-red">Unable to load the breakdown report.</p>;
	}

	return <BreakdownReviewPage detail={detail} />;
};

export default BreakdownReportReview;
