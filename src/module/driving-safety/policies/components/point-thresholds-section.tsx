import React from "react";
import { UseFormReturn } from "react-hook-form";

import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";

import { IDrivingSafetyPointThreshold } from "../types";
import { IPoliciesSchema } from "../utils/policies-schema";
import PolicySectionCard from "./policy-section-card";

const PointThresholdsSection = ({
	pointThresholds,
	form,
	isEditing,
}: {
	pointThresholds: IDrivingSafetyPointThreshold[];
	form: UseFormReturn<IPoliciesSchema>;
	isEditing: boolean;
}) => {
	const errors = form.formState.errors.pointThresholds;

	return (
		<PolicySectionCard
			title="Disciplinary point thresholds"
			meta={
				isEditing
					? "Consequence triggered at each accumulated total"
					: "Cumulative points over a rolling 12-month period"
			}
		>
			<ul>
				{pointThresholds.map((threshold, index) => (
					<li
						key={threshold.id}
						className="flex items-center justify-between gap-4 border-t border-brand-dark10 px-4 py-3"
					>
						<div className="flex-1">
							{isEditing ? (
								<>
									<Input className="max-w-[320px]" {...form.register(`pointThresholds.${index}.consequence`)} />
									<FormError error={errors?.[index]?.consequence?.message} />
								</>
							) : (
								<p className="text-sm font-medium text-brand-dark">{threshold.consequence}</p>
							)}
						</div>

						<div className="flex items-center gap-2">
							{isEditing ? (
								<>
									<Input className="w-16" inputMode="numeric" {...form.register(`pointThresholds.${index}.points`)} />
									<FormError error={errors?.[index]?.points?.message} />
								</>
							) : (
								<span className="text-sm font-medium text-brand-dark">{threshold.points}</span>
							)}
							<span className="text-xs uppercase text-brand-greyLight">Points</span>
						</div>
					</li>
				))}
			</ul>
		</PolicySectionCard>
	);
};

export default PointThresholdsSection;
