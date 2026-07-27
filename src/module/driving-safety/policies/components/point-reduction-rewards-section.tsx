import { Gift, Zap } from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";

import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { IDrivingSafetyPolicyConfig } from "../types";
import { IPoliciesSchema } from "../utils/policies-schema";

const PointReductionRewardsSection = ({
	config,
	form,
	isEditing,
}: {
	config: IDrivingSafetyPolicyConfig;
	form: UseFormReturn<IPoliciesSchema>;
	isEditing: boolean;
}) => {
	const errors = form.formState.errors.config;

	return (
		<section className="space-y-3">
			<h4 className="text-base font-medium text-brand-dark">Point reduction & rewards</h4>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="space-y-3 rounded-xl border border-brand-dark10 bg-white p-4">
					<div className="flex items-center gap-2">
						<Zap size={16} />
						<h5 className="text-sm font-medium text-brand-dark">Point reduction</h5>
					</div>

					{isEditing ? (
						<div className="flex flex-wrap items-center gap-2 text-sm text-brand-grey">
							<span>Reduce</span>
							<Input className="w-14" inputMode="numeric" {...form.register("config.pointReductionPerQuarter")} />
							<span>point(s) per quarter, up to</span>
							<Input className="w-14" inputMode="numeric" {...form.register("config.maxPointReductionPerYear")} />
							<span>per year</span>
						</div>
					) : (
						<p className="text-sm text-brand-grey">
							Reduce <span className="font-medium text-brand-dark">{config.pointReductionPerQuarter}</span> point per
							quarter with no points assessed, up to a maximum of{" "}
							<span className="font-medium text-brand-dark">{config.maxPointReductionPerYear}</span> per year.
						</p>
					)}

					<FormError error={errors?.pointReductionPerQuarter?.message ?? errors?.maxPointReductionPerYear?.message} />

					<div className="space-y-1">
						<p className="text-xs uppercase text-brand-greyLight">Policy verbiage</p>
						{isEditing ? (
							<>
								<Textarea {...form.register("config.pointReductionVerbiage")} />
								<FormError error={errors?.pointReductionVerbiage?.message} />
							</>
						) : (
							<p className="text-sm text-brand-dark">{config.pointReductionVerbiage}</p>
						)}
					</div>
				</div>

				<div className="space-y-3 rounded-xl border border-brand-dark10 bg-white p-4">
					<div className="flex items-center gap-2">
						<Gift size={16} />
						<h5 className="text-sm font-medium text-brand-dark">Rewards</h5>
					</div>

					<div className="space-y-1">
						<p className="text-xs uppercase text-brand-greyLight">No points accumulated during a quarter</p>
						{isEditing ? (
							<Input {...form.register("config.quarterlyReward")} />
						) : (
							<p className="text-sm text-brand-dark">
								One point reduction in overall point total → {config.quarterlyReward ?? "—"}
							</p>
						)}
					</div>

					<div className="space-y-1">
						<p className="text-xs uppercase text-brand-greyLight">No points accumulated during a year</p>
						{isEditing ? (
							<Input {...form.register("config.annualReward")} />
						) : (
							<p className="text-sm text-brand-dark">{config.annualReward ?? "—"}</p>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default PointReductionRewardsSection;
