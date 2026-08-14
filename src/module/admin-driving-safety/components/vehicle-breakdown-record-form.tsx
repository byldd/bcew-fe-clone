"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { routes } from "@/config/routes";

import { useAdminBreakdownFormOptions, useCreateAdminVehicleBreakdown } from "../hooks/useAdminVehicleBreakdown";
import { adminVehicleBreakdownSchema, IAdminVehicleBreakdownSchema } from "../utils/vehicle-breakdown-schema";
import {
	bcewVehicleTowedField,
	breakdownDescriptionField,
	buildIssueCategoryField,
	buildIssueTypeField,
	costOnSpotField,
	toBreakdownOptions,
	truckField,
} from "../utils/vehicle-breakdown-fields";

const VehicleBreakdownRecordForm = () => {
	const router = useRouter();
	const { data: formOptions } = useAdminBreakdownFormOptions();
	const createBreakdown = useCreateAdminVehicleBreakdown();

	const form = useForm<IAdminVehicleBreakdownSchema>({
		resolver: zodResolver(adminVehicleBreakdownSchema),
		defaultValues: {
			truckNumber: "",
			issueCategoryId: "",
			issueTypeId: "",
			description: "",
			bcewVehicleTowed: false,
			costOnSpot: "",
		},
	});

	const issueCategoryId = useWatch({ control: form.control, name: "issueCategoryId" });
	const isTowed = useWatch({ control: form.control, name: "bcewVehicleTowed" }) === true;

	// Reset the dependent issue type whenever the category changes.
	useEffect(() => {
		form.setValue("issueTypeId", "");
	}, [issueCategoryId, form]);

	// Cost only applies when the vehicle was towed — drop any stale value once it's toggled off.
	useEffect(() => {
		if (!isTowed) form.setValue("costOnSpot", "");
	}, [isTowed, form]);

	const categories = [...(formOptions?.categories ?? [])].sort((a, b) => a.name.localeCompare(b.name));
	const selectedCategory = categories.find((category) => category.id === issueCategoryId);

	const onSubmit = async (data: IAdminVehicleBreakdownSchema) => {
		try {
			await createBreakdown.mutateAsync({
				truckNumber: data.truckNumber,
				issueCategoryId: data.issueCategoryId,
				issueTypeId: data.issueTypeId,
				description: data.description || undefined,
				bcewVehicleTowed: data.bcewVehicleTowed,
				costOnSpot: data.costOnSpot?.trim() ? Number(data.costOnSpot) : null,
			});
			openSuccessToast("Breakdown record created");
			router.push(routes.admin.drivingSafetyIncidentReports);
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 rounded-[8px] border-none bg-white p-4 shadow-sm"
			>
				<div className="space-y-1">
					<h4 className="text-sm font-medium text-brand-grey">Vehicle Breakdown — Vehicle Request</h4>
					<p className="text-xs text-brand-grey">
						Log a breakdown request for a truck. Category and issue drive the request; a note captures detail. Driver
						step 2 is to call Nolan Yeager.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<FormInputWrapper form={form} fieldConfig={truckField} />
					<FormInputWrapper form={form} fieldConfig={buildIssueCategoryField(toBreakdownOptions(categories))} />
					<FormInputWrapper
						form={form}
						fieldConfig={buildIssueTypeField(toBreakdownOptions(selectedCategory?.issueTypes ?? []))}
					/>
				</div>

				<FormInputWrapper form={form} fieldConfig={breakdownDescriptionField} />

				<div className="space-y-2 border-t border-brand-dark10 py-4">
					<h4 className="text-sm font-medium text-brand-grey">Tow & Impound (optional)</h4>
					<FormInputWrapper form={form} fieldConfig={bcewVehicleTowedField} wrapperClassName="py-2" />
					{isTowed && <FormInputWrapper form={form} fieldConfig={costOnSpotField} />}
				</div>

				<div className="flex gap-2 pt-2">
					<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
						Cancel
					</Button>
					<Button type="submit" variant="filled" className="w-full" loading={createBreakdown.isPending}>
						Create Vehicle Breakdown
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default VehicleBreakdownRecordForm;
