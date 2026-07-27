import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { IUpdateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { FormField } from "@/components/ui/form";
import { InputField } from "@/components/ui/inputField";
import { useSubContractors } from "@/module/admin-sub-contractor/hooks/useSubContracrtor";
import { SelectField } from "@/components/ui/selectField";
import { FORM_MODE } from "@/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SubcontractorField = ({ readOnly = false }: { mode: FORM_MODE; readOnly?: boolean }) => {
	const formContext = useFormContext<IUpdateDailyJobFormSchema>();
	const { data: subContractors } = useSubContractors();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const subContractorOptions = useMemo(() => {
		return (
			subContractors?.map((subContractor) => ({
				label: subContractor.name,
				value: subContractor.id,
			})) || []
		);
	}, [subContractors]);

	return (
		<>
			<div className="mt-4 flex justify-between gap-4">
				<FormField
					control={formContext.control}
					name="subcontractorId"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormControl>
								<SelectField
									label={tjobCards.subContractor}
									options={subContractorOptions}
									value={field.value || ""}
									onValueChange={(value) => {
										field.onChange(value);
									}}
									disabled={readOnly}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<div className="mb-4 mt-4 flex justify-between gap-4">
				<FormField
					control={formContext.control}
					name="subcontactorCrewName"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormControl>
								<InputField
									placeholder={tjobCards.subContractorCrewName}
									label={tjobCards.subContractorCrewName}
									disabled
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={formContext.control}
					name="subcontactorCrewLeaderName"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormControl>
								<InputField
									placeholder={tjobCards.subContractorCrewLeader}
									label={tjobCards.subContractorCrewLeader}
									disabled
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</>
	);
};

export default SubcontractorField;
