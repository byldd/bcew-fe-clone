import React from "react";
import { UseFormReturn } from "react-hook-form";

import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { IDrivingSafetyViolationType } from "../types";
import { POLICY_NAME } from "../utils/constants";
import { IPoliciesSchema } from "../utils/policies-schema";
import PolicySectionCard from "./policy-section-card";

const ViolationTypesSection = ({
	violationTypes,
	form,
	isEditing,
}: {
	violationTypes: IDrivingSafetyViolationType[];
	form: UseFormReturn<IPoliciesSchema>;
	isEditing: boolean;
}) => {
	const errors = form.formState.errors.violationTypes;

	return (
		<PolicySectionCard title="Violation types & point values" meta={`${violationTypes.length} types · ${POLICY_NAME}`}>
			<Table>
				<TableHeader>
					<TableRow className="border-t border-brand-dark10 hover:bg-transparent">
						<TableHead className="w-[30%] px-4 text-xs uppercase text-brand-greyLight">Type</TableHead>
						<TableHead className="w-[10%] text-center text-xs uppercase text-brand-greyLight">Points</TableHead>
						<TableHead className="w-[20%] text-center text-xs uppercase text-brand-greyLight">
							Documentation required
						</TableHead>
						<TableHead className="w-[40%] text-xs uppercase text-brand-greyLight">
							Policy verbiage{isEditing ? " — shown to employees & admins" : ""}
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{violationTypes.map((violationType, index) => (
						<TableRow key={violationType.id} className="border-b border-brand-dark10 hover:bg-transparent">
							<TableCell className="px-4 text-sm font-medium text-brand-dark">
								{isEditing ? (
									<>
										<Input {...form.register(`violationTypes.${index}.name`)} />
										<FormError error={errors?.[index]?.name?.message} />
									</>
								) : (
									violationType.name
								)}
							</TableCell>

							<TableCell className="text-center text-sm font-medium text-brand-dark">
								{isEditing ? (
									<>
										<Input
											className="mx-auto w-16"
											inputMode="numeric"
											placeholder="TBD"
											{...form.register(`violationTypes.${index}.points`)}
										/>
										<FormError error={errors?.[index]?.points?.message} />
									</>
								) : (
									(violationType.points ?? "TBD")
								)}
							</TableCell>

							<TableCell className="text-center text-sm text-brand-grey">
								{isEditing ? (
									<>
										<Input {...form.register(`violationTypes.${index}.documentationRequired`)} />
										<FormError error={errors?.[index]?.documentationRequired?.message} />
									</>
								) : (
									violationType.documentationRequired
								)}
							</TableCell>

							<TableCell className="text-sm text-brand-grey">
								{isEditing ? (
									<>
										<Input {...form.register(`violationTypes.${index}.policyVerbiage`)} />
										<FormError error={errors?.[index]?.policyVerbiage?.message} />
									</>
								) : (
									violationType.policyVerbiage
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</PolicySectionCard>
	);
};

export default ViolationTypesSection;
