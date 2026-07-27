"use client";

import { AlertTriangle, FileText } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { VEHICLE_ACCIDENT_PHOTO_CATEGORY } from "@/module/employee-safety/enums";

import { IAccidentReviewDetail } from "../types";
import { ACCIDENT_DOCUMENT_CATEGORY_LABEL } from "../utils/constants";
import { fileNameFromKeyFile } from "../utils/accident-review-display";
import { insuranceCorrespondenceField, repairEstimateField } from "../utils/accident-review-fields";
import { IAccidentReviewSchema } from "../utils/accident-review-schema";
import { ReviewCard } from "./review-card";

const TECHNICIAN_CATEGORIES = [
	VEHICLE_ACCIDENT_PHOTO_CATEGORY.BCEW_VEHICLE,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY.OTHER_VEHICLE_PROPERTY,
	VEHICLE_ACCIDENT_PHOTO_CATEGORY.SUPPORTING_DOCUMENT,
];

const AccidentDocuments = ({
	form,
	report,
	disabled,
}: {
	form: UseFormReturn<IAccidentReviewSchema>;
	report: IAccidentReviewDetail;
	disabled: boolean;
}) => {
	const repairEstimate = useWatch({ control: form.control, name: "repairEstimate" });
	const submittedDocuments = report.photos.filter((photo) => TECHNICIAN_CATEGORIES.includes(photo.category));

	return (
		<ReviewCard title="Documents">
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<div className="space-y-2">
					{submittedDocuments.map((document) => (
						<a
							key={document.id}
							href={document.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-between gap-3 rounded-[10px] border border-brand-dark10 px-3 py-2.5"
						>
							<span className="flex min-w-0 items-center gap-2 text-sm text-blue-600 underline-offset-2 hover:underline">
								<FileText size={16} className="shrink-0 text-brand-dark50" />
								<span className="truncate">{fileNameFromKeyFile(document.keyFile)}</span>
							</span>
							<span className="shrink-0 text-xs text-brand-dark50">
								{ACCIDENT_DOCUMENT_CATEGORY_LABEL[document.category]}
							</span>
						</a>
					))}

					{!repairEstimate.length && (
						<p className="flex items-center gap-2 rounded-[10px] border border-brand-dark10 px-3 py-2.5 text-sm text-brand-red">
							<AlertTriangle size={16} className="shrink-0" />
							Repair estimate — missing
						</p>
					)}
				</div>

				<div className="space-y-4">
					<FormInputWrapper form={form} fieldConfig={repairEstimateField} disabled={disabled} canDelete={!disabled} />
					<FormInputWrapper
						form={form}
						fieldConfig={insuranceCorrespondenceField}
						disabled={disabled}
						canDelete={!disabled}
					/>
				</div>
			</div>
		</ReviewCard>
	);
};

export default AccidentDocuments;
