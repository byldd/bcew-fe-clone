"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Check } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import SectionHeader from "@/components/shared/section-header";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PointReductionRewardsSection from "../components/point-reduction-rewards-section";
import PointThresholdsSection from "../components/point-thresholds-section";
import PolicyHandbookTab from "../components/policy-handbook-tab";
import ViolationTypesSection from "../components/violation-types-section";
import { useDrivingSafetyPolicies, useUpdateDrivingSafetyPolicies } from "../hooks/useDrivingSafetyPolicies";
import { useDrivingSafetyPoliciesParams } from "../hooks/useDrivingSafetyPoliciesParams";
import { POLICY_TAB } from "../utils/enums";
import { IPoliciesSchema, policiesSchema, toPoliciesFormValues, toPoliciesPayload } from "../utils/policies-schema";

const TAB_TRIGGER_CLASS =
	"inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark";

const DrivingSafetyPolicies = () => {
	const { getParams, setParams } = useDrivingSafetyPoliciesParams();
	const { tab } = getParams();

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
			<SectionHeader
				title="Policies"
				actions={
					tab === POLICY_TAB.VIOLATIONS &&
					data &&
					(isEditing ? (
						<div className="flex items-center gap-2">
							<Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
								Cancel
							</Button>
							<Button type="submit" variant="filled" loading={isSaving}>
								<Check size={16} /> Save changes
							</Button>
						</div>
					) : (
						<Button type="button" variant="filled" onClick={startEditing}>
							Edit Policies
						</Button>
					))
				}
			/>

			<Tabs value={tab} onValueChange={(value) => setParams({ tab: value as POLICY_TAB })}>
				<TabsList className="inline-flex h-10 w-full items-center justify-start gap-2 rounded-md bg-transparent p-0">
					<TabsTrigger className={TAB_TRIGGER_CLASS} value={POLICY_TAB.VIOLATIONS}>
						Driving Safety Violations
					</TabsTrigger>
					<TabsTrigger className={TAB_TRIGGER_CLASS} value={POLICY_TAB.HANDBOOK}>
						Policy Handbook
					</TabsTrigger>
				</TabsList>

				<TabsContent value={POLICY_TAB.VIOLATIONS} className="space-y-4">
					{isPending && <p className="text-sm text-brand-grey">Loading policies...</p>}

					{isError && (
						<p className="text-sm text-brand-red">Could not load the driving safety policy. Please try again.</p>
					)}

					{data && (
						<>
							<ViolationTypesSection violationTypes={data.violationTypes} form={form} isEditing={isEditing} />
							<PointThresholdsSection pointThresholds={data.pointThresholds} form={form} isEditing={isEditing} />
							<PointReductionRewardsSection config={data.config} form={form} isEditing={isEditing} />
						</>
					)}
				</TabsContent>

				<TabsContent value={POLICY_TAB.HANDBOOK}>
					<PolicyHandbookTab />
				</TabsContent>
			</Tabs>
		</form>
	);
};

export default DrivingSafetyPolicies;
