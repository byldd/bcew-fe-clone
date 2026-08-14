import React from "react";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppTooltip } from "@/components/ui/tooltip";
import { MultiSelect } from "@/components/common/form/multi-select";
import type { IOptions } from "@/components/common/form/types";
import { VIOLATION_TYPE_CATEGORY } from "@/module/driving-safety/incident-reports/utils/enums";
import { VIOLATION_TYPE_CATEGORY_LABEL } from "@/module/driving-safety/incident-reports/utils/constants";

import { IDrivingSafetyViolationType } from "../types";
import { POLICY_NAME } from "../utils/constants";
import { IPoliciesSchema } from "../utils/policies-schema";
import PolicySectionCard from "./policy-section-card";
import { JOB_SITE_INJURY_REPORT_PREFIX } from "@/module/admin-job-site-safety/utils/dashboard-constants";
import { ReadonlyURLSearchParams } from "next/navigation";

const CATEGORY_OPTIONS: IOptions[] = Object.values(VIOLATION_TYPE_CATEGORY).map((category) => ({
	label: VIOLATION_TYPE_CATEGORY_LABEL[category],
	value: category,
}));

// Wraps a field in a hover tooltip showing its full value — these inputs sit in
// narrow table columns, so long text gets clipped while typing/reviewing.
const FieldWithHoverPreview = ({ value, children }: { value?: string; children: React.ReactElement }) =>
	value ? <AppTooltip trigger={children} text={value} /> : children;

const NEW_VIOLATION_TYPE: IPoliciesSchema["violationTypes"][number] = {
	id: "",
	name: "",
	points: "",
	documentationRequired: "",
	policyVerbiage: "",
	categories: [],
};

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
	const { fields, prepend, remove } = useFieldArray({
		control: form.control,
		name: "violationTypes",
		keyName: "fieldKey",
	});

	const rows = isEditing ? fields : violationTypes;

	return (
		<PolicySectionCard
			title="Violation Types & Point Values"
			meta={`${violationTypes.length} types · ${POLICY_NAME}`}
			actions={
				isEditing && (
					<Button
						type="button"
						variant="filled"
						size="sm"
						className="h-8 rounded-[8px]"
						onClick={() => prepend(NEW_VIOLATION_TYPE)}
					>
						<Plus size={14} /> Add New Violation Type
					</Button>
				)
			}
		>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="border-t border-brand-dark10 hover:bg-transparent">
							<TableHead className="w-[25%] px-4 text-xs text-brand-greyLight">Type</TableHead>
							<TableHead className="w-[20%] text-xs text-brand-greyLight">Category</TableHead>
							<TableHead className="w-[10%] text-center text-xs text-brand-greyLight">Points</TableHead>
							<TableHead className="w-[20%] text-center text-xs text-brand-greyLight">Documentation Required</TableHead>
							<TableHead className="w-[40%] text-xs text-brand-greyLight">
								Policy Verbiage{isEditing ? " — shown to employees & admins" : ""}
							</TableHead>
							{isEditing && <TableHead className="w-10" />}
						</TableRow>
					</TableHeader>

					<TableBody>
						{rows.map((violationType, index) => (
							<TableRow
								key={"fieldKey" in violationType ? violationType.fieldKey : violationType.id}
								className="border-b border-brand-dark10 hover:bg-transparent"
							>
								<TableCell className="px-4 text-sm font-medium text-brand-dark">
									{isEditing ? (
										<>
											<Input placeholder="Type here" {...form.register(`violationTypes.${index}.name`)} />
											<FormError error={errors?.[index]?.name?.message} />
										</>
									) : (
										violationType.name
									)}
								</TableCell>

								<TableCell className="text-sm text-brand-grey">
									{isEditing ? (
										<Controller
											control={form.control}
											name={`violationTypes.${index}.categories`}
											render={({ field }) => (
												<MultiSelect
													options={CATEGORY_OPTIONS}
													selected={CATEGORY_OPTIONS.filter((option) =>
														field.value?.includes(option.value as VIOLATION_TYPE_CATEGORY)
													)}
													onChange={(selected) =>
														field.onChange(selected.map((option) => option.value as VIOLATION_TYPE_CATEGORY))
													}
													placeholder="Select Category"
													showCheckbox
													allOptionLabel="All Categories"
													showSearch={false}
													showSelected={false}
												/>
											)}
										/>
									) : (
										violationType.categories.map((category) => VIOLATION_TYPE_CATEGORY_LABEL[category]).join(", ") ||
										"--"
									)}
								</TableCell>

								<TableCell className="text-center text-sm font-medium text-brand-dark">
									{isEditing ? (
										<>
											<Input
												className="mx-auto w-16"
												inputMode="numeric"
												placeholder="-- pt"
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
											<FieldWithHoverPreview value={form.watch(`violationTypes.${index}.documentationRequired`)}>
												<Input
													placeholder="Required Documents"
													{...form.register(`violationTypes.${index}.documentationRequired`)}
												/>
											</FieldWithHoverPreview>
											<FormError error={errors?.[index]?.documentationRequired?.message} />
										</>
									) : (
										violationType.documentationRequired
									)}
								</TableCell>

								<TableCell className="text-sm text-brand-grey">
									{isEditing ? (
										<>
											<FieldWithHoverPreview value={form.watch(`violationTypes.${index}.policyVerbiage`)}>
												<Input placeholder="Description" {...form.register(`violationTypes.${index}.policyVerbiage`)} />
											</FieldWithHoverPreview>
											<FormError error={errors?.[index]?.policyVerbiage?.message} />
										</>
									) : (
										violationType.policyVerbiage
									)}
								</TableCell>

								{isEditing && (
									<TableCell className="text-center">
										<button
											type="button"
											aria-label="Remove violation type"
											className="text-brand-greyLight hover:text-brand-red"
											onClick={() => remove(index)}
										>
											<X size={16} />
										</button>
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</PolicySectionCard>
	);
};

export default ViolationTypesSection;
