"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Check } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import SectionHeader from "@/components/shared/section-header";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";

import PointReductionRewardsSection from "../components/point-reduction-rewards-section";
import PointThresholdsSection from "../components/point-thresholds-section";
import ViolationTypesSection from "../components/violation-types-section";
import { useDrivingSafetyPolicies, useUpdateDrivingSafetyPolicies } from "../hooks/useDrivingSafetyPolicies";
import { IPoliciesSchema, policiesSchema, toPoliciesFormValues, toPoliciesPayload } from "../utils/policies-schema";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

const DrivingSafetyPolicies = () => {
	const [isEditing, setIsEditing] = useState(false);

	const { data, isPending, isError } = useDrivingSafetyPolicies();
	const { mutateAsync: updatePolicies, isPending: isSaving } = useUpdateDrivingSafetyPolicies();

	const form = useForm<IPoliciesSchema>({
		resolver: zodResolver(policiesSchema),
		defaultValues: {
			violationTypes: [],
			pointThresholds: [],
			config: {
				pointReductionPerQuarter: "",
				maxPointReductionPerYear: "",
				pointReductionVerbiage: "",
				quarterlyReward: "",
				annualReward: "",
			},
		},
	});

	const startEditing = () => {
		if (!data) return;

		form.reset(toPoliciesFormValues(data));
		setIsEditing(true);
	};

	const onSubmit = async (values: IPoliciesSchema) => {
		try {
			await updatePolicies(toPoliciesPayload(values));
			openSuccessToast("Policies updated");
			setIsEditing(false);
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<SectionHeader title="Policies" />
				<WriteAccessWrapper>
					{data &&
						(isEditing ? (
							<div className="flex items-center gap-2">
								<Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
									Cancel
								</Button>
								<Button type="submit" variant="filled" loading={isSaving}>
									<Check size={16} /> Save Changes
								</Button>
							</div>
						) : (
							<Button type="button" variant="filled" onClick={startEditing}>
								Edit Policies
							</Button>
						))}
				</WriteAccessWrapper>
			</div>

			{isPending && <p className="text-sm text-brand-grey">Loading policies...</p>}

			{isError && <p className="text-sm text-brand-red">Could not load the driving safety policy. Please try again.</p>}

			{data && (
				<div className="space-y-4">
					<ViolationTypesSection violationTypes={data.violationTypes} form={form} isEditing={isEditing} />
					<PointThresholdsSection pointThresholds={data.pointThresholds} form={form} isEditing={isEditing} />
					<PointReductionRewardsSection config={data.config} form={form} isEditing={isEditing} />
				</div>
			)}
		</form>
	);
};

export default DrivingSafetyPolicies;
