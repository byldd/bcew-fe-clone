"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openSuccessToast } from "@/components/toast";

import { formExampleSchema, IFormExampleSchema } from "../utils/form-example-schema";
import { formExampleFields } from "../utils/form-example-fields";

const FormExamplePage = () => {
	const form = useForm<IFormExampleSchema>({
		resolver: zodResolver(formExampleSchema),
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			bio: "",
			department: "",
			skills: [],
			country: "",
			gender: "",
			salary: 0,
			receiveNotifications: false,
			attachments: [],
		},
	});

	const onSubmit = (data: IFormExampleSchema) => {
		openSuccessToast("Form submitted successfully.");
	};

	return (
		<div className="mx-auto w-full max-w-2xl p-6">
			<h1 className="mb-1 text-xl font-semibold">FormInputWrapper Example</h1>
			<p className="mb-6 text-sm text-muted-foreground">
				A sample form showing every field variant supported by <code>FormInputWrapper</code>.
			</p>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{formExampleFields.map((fieldConfig) => (
						<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
					))}

					<Button type="submit" variant="filled" className="w-full" disabled={form.formState.isSubmitting}>
						Submit
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default FormExamplePage;
