"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import BackButton from "@/components/common/back-button";
import { openErrorToast } from "@/components/toast";

import BreakdownAuthorizedPersonCard from "../components/breakdown-authorized-person-card";
import VehicleBreakdownSuccess from "../components/vehicle-breakdown-success";
import { useBreakdownFormOptions, useCreateVehicleBreakdown } from "../hooks/useVehicleBreakdown";
import { vehicleBreakdownSchema, IVehicleBreakdownSchema } from "../utils/vehicle-breakdown-schema";
import {
	breakdownDescriptionField,
	buildIssueCategoryField,
	buildIssueTypeField,
	toBreakdownOptions,
	truckField,
} from "../utils/vehicle-breakdown-fields";

const NewVehicleBreakdownReportTemplate = () => {
	const router = useRouter();
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { data: formOptions } = useBreakdownFormOptions();
	const createBreakdown = useCreateVehicleBreakdown();

	const form = useForm<IVehicleBreakdownSchema>({
		resolver: zodResolver(vehicleBreakdownSchema),
		defaultValues: {
			truckNumber: "",
			issueCategoryId: "",
			issueTypeId: "",
			description: "",
		},
	});

	const issueCategoryId = useWatch({ control: form.control, name: "issueCategoryId" });

	// Reset the dependent issue type whenever the category changes.
	useEffect(() => {
		form.setValue("issueTypeId", "");
	}, [issueCategoryId, form]);

	const categories = formOptions?.categories ?? [];
	const selectedCategory = categories.find((category) => category.id === issueCategoryId);

	const onSubmit = async (data: IVehicleBreakdownSchema) => {
		try {
			await createBreakdown.mutateAsync({
				truckNumber: data.truckNumber,
				issueCategoryId: data.issueCategoryId,
				issueTypeId: data.issueTypeId,
				description: data.description || undefined,
			});
			setIsSubmitted(true);
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	if (isSubmitted) return <VehicleBreakdownSuccess />;

	return (
		<div className="min-h-screen w-full bg-brand-bgLightgrey p-4">
			<div className="mb-3 ml-[-10px] flex items-center gap-1">
				<BackButton />
				<h3 className="text-xl font-medium">Report Vehicle Breakdown</h3>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pb-32">
					<section className="space-y-3 rounded-xl bg-white p-4">
						<FormInputWrapper form={form} fieldConfig={truckField} />
						<FormInputWrapper form={form} fieldConfig={buildIssueCategoryField(toBreakdownOptions(categories))} />
						<FormInputWrapper
							form={form}
							fieldConfig={buildIssueTypeField(toBreakdownOptions(selectedCategory?.issueTypes ?? []))}
						/>
						<FormInputWrapper form={form} fieldConfig={breakdownDescriptionField} />
					</section>

					<BreakdownAuthorizedPersonCard />

					<div className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 bg-white px-4 py-3 shadow-md">
						<Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
							Cancel
						</Button>
						<Button type="submit" variant="filled" className="w-full" loading={createBreakdown.isPending}>
							Report Breakdown
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default NewVehicleBreakdownReportTemplate;
