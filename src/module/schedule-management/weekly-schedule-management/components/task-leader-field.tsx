import { SelectField } from "@/components/ui/selectField";
import React, { useMemo } from "react";
import { ICreateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const TaskLeaderField = ({ disabled = false }: { disabled?: boolean }) => {
	const formContext = useFormContext<ICreateDailyJobFormSchema>();
	const { jobEmployeeAssignments } = formContext.watch();

	const crewMembers = useMemo(() => {
		return (
			jobEmployeeAssignments?.map((assignment) => ({
				value: assignment.employeeId,
				label: assignment.employeeName || "",
			})) || []
		);
	}, [jobEmployeeAssignments]);

	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	return (
		<div className="w-full">
			<FormField
				control={formContext.control}
				name="taskLeaderId"
				render={({ field }) => {
					return (
						<FormItem className="w-full">
							<FormControl>
								<SelectField
									label={tjobCards.taskLeader}
									options={crewMembers}
									value={field.value || ""}
									onValueChange={(val) => {
										if (val) {
											field.onChange(val);
										}
									}}
									placeholder={tjobCards.selectTaskLeader}
									disabled={disabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					);
				}}
			/>
		</div>
	);
};

export default TaskLeaderField;
