"use client";

import { UseFormReturn, useWatch } from "react-hook-form";

import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { IOptions } from "@/components/common/form/types";
import { Input } from "@/components/ui/input";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { IDrivingSafetyViolationType } from "@/module/driving-safety/policies/types";

import { IAccidentReviewSchema } from "../utils/accident-review-schema";
import { buildViolationTypeField } from "../utils/accident-review-fields";
import { DASH } from "../utils/accident-review-display";
import { ReviewCard } from "./review-card";

type SavedViolationType = Pick<IDrivingSafetyViolationType, "id" | "name" | "points">;

const AccidentViolationAssessment = ({
	form,
	violationTypes,
	savedType,
	savedPoints,
	disabled,
	className,
}: {
	form: UseFormReturn<IAccidentReviewSchema>;
	violationTypes: IDrivingSafetyViolationType[];
	savedType: SavedViolationType | null;
	savedPoints: number | null;
	disabled: boolean;
	className?: string;
}) => {
	const selectedId = useWatch({ control: form.control, name: "violationTypeId" });

	const availableTypes: SavedViolationType[] =
		savedType && !violationTypes.some((violationType) => violationType.id === savedType.id)
			? [savedType, ...violationTypes]
			: violationTypes;

	const selected = availableTypes.find((violationType) => violationType.id === selectedId);

	const pointWeight = selected?.points ?? savedPoints ?? DASH;

	const options: IOptions[] = availableTypes.map((violationType) => ({
		label: violationType.name,
		value: violationType.id,
	}));

	return (
		<ReviewCard title="Violation Assessment" className={className}>
			<div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
				{disabled ? (
					<div className="space-y-1.5">
						<FormLabelRequired
							label="Violation Type"
							required
							className="font-inter text-sm font-normal text-brand-grey"
						/>
						<Input value={selected?.name ?? DASH} readOnly disabled className="h-10 rounded-[8px]" />
					</div>
				) : (
					<FormInputWrapper form={form} fieldConfig={buildViolationTypeField(options)} />
				)}

				<div className="space-y-1.5">
					<FormLabelRequired label="Point Weight" className="font-inter text-sm font-normal text-brand-grey" />
					<Input value={pointWeight} readOnly disabled className="h-10 rounded-[8px]" />
				</div>
			</div>
		</ReviewCard>
	);
};

export default AccidentViolationAssessment;
