"use client";

import { useEffect } from "react";
import { Pencil } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";

import { injuredInAccidentField } from "../utils/accident-report-fields";
import { IAccidentReportSchema } from "../utils/accident-report-schema";
import { YES_NO } from "../enums";

type InjuryReportSectionProps = {
	form: UseFormReturn<IAccidentReportSchema>;
	onOpenInjury: () => void;
	disabled?: boolean;
};

const InjuryReportSection = ({ form, onOpenInjury, disabled }: InjuryReportSectionProps) => {
	const injured = useWatch({ control: form.control, name: "wasDriverInjured" });
	const hasInjury = Boolean(useWatch({ control: form.control, name: "injury.bodyPartInjured" })?.trim());
	const isInjured = injured === YES_NO.YES;

	useEffect(() => {
		if (injured === YES_NO.NO && hasInjury) form.resetField("injury");
	}, [injured, hasInjury, form]);

	return (
		<section className="space-y-3 rounded-[8px] bg-white p-3">
			<FormInputWrapper
				form={form}
				fieldConfig={injuredInAccidentField}
				disabled={disabled}
				wrapperClassName="space-y-3"
			/>

			{isInjured && (!disabled || hasInjury) && (
				<Button type="button" variant="filled" className="w-full" onClick={onOpenInjury}>
					{hasInjury && <Pencil />}
					{hasInjury ? "Injury details added" : "Add Injury Details"}
				</Button>
			)}
		</section>
	);
};

export default InjuryReportSection;
