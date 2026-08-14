"use client";

import { useEffect } from "react";
import { AxiosError } from "axios";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { useUpdateBreakdownReport } from "../hooks/useBreakdownReport";
import { IBreakdownReportDetail } from "../types";
import { BREAKDOWN_REPORT_PREFIX, formatReportNumber } from "../utils/constants";
import { bcewVehicleTowedField, costOnSpotField } from "../utils/breakdown-review-fields";
import { breakdownReviewSchema, IBreakdownReviewSchema } from "../utils/breakdown-review-schema";
import BreakdownKeyResources from "./breakdown-key-resources";

const InfoRow = ({ label, value }: { label: string; value: string }) => (
	<div className="flex items-start justify-between gap-4 border-b pb-1 text-sm">
		<span className="text-brand-dark50">{label}</span>
		<span className="max-w-[60%] text-right text-brand-dark">{value}</span>
	</div>
);

const BreakdownReviewForm = ({ detail, onClose }: { detail: IBreakdownReportDetail; onClose: () => void }) => {
	const updateReport = useUpdateBreakdownReport(detail.id);

	const form = useForm<IBreakdownReviewSchema>({
		resolver: zodResolver(breakdownReviewSchema),
		defaultValues: {
			bcewVehicleTowed: detail.bcewVehicleTowed,
			costOnSpot: detail.costOnSpot ?? "",
		},
	});

	const isTowed = useWatch({ control: form.control, name: "bcewVehicleTowed" }) === true;
	const costValue = useWatch({ control: form.control, name: "costOnSpot" });

	// Cost only applies when the vehicle was towed — drop any stale value once it's toggled off.
	useEffect(() => {
		if (!isTowed) form.setValue("costOnSpot", "");
	}, [isTowed, form]);

	const canSave = isTowed && Number(costValue) > 0;

	const onSubmit = (values: IBreakdownReviewSchema) => {
		updateReport.mutate(
			{
				bcewVehicleTowed: values.bcewVehicleTowed,
				costOnSpot: values.costOnSpot.trim() === "" ? null : Number(values.costOnSpot),
			},
			{
				onSuccess: () => {
					openSuccessToast("Breakdown report updated");
					onClose();
				},
				onError: (error) => openErrorToast({ error: error as AxiosError<{ message: string }> }),
			}
		);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="space-y-4 px-2 pt-4">
					<div className="space-y-3">
						<h3 className="border-b pb-1 text-sm font-medium text-brand-dark50">Basic Information</h3>
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

					<div className="space-y-2 border-brand-dark10">
						<FormInputWrapper form={form} fieldConfig={bcewVehicleTowedField} wrapperClassName="py-1" />
						{isTowed && <FormInputWrapper form={form} fieldConfig={costOnSpotField} />}
					</div>

					<BreakdownKeyResources />
				</div>

				<div className="sticky bottom-0 flex gap-3 border-t border-brand-dark10 bg-white px-2 pt-4">
					<Button type="button" variant="outline" className="w-full" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="filled"
						className="w-full"
						disabled={!canSave}
						loading={updateReport.isPending}
					>
						Save
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default BreakdownReviewForm;
