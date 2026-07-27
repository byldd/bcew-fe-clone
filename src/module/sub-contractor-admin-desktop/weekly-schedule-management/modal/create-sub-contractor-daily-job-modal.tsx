import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectField } from "@/components/ui/selectField";

import {
	createSubContractorDailyJobFormSchema,
	ICreateSubContractorDailyJobFormSchema,
} from "../utils/create-sub-contactor-daily-job-form";
import { useCreateDailyJob } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { toMidnightDateString, getTodayDate } from "@/lib/utils/date";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import useAuthStore from "@/store/auth-store";
import { IWeekScheduleResponse } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import JobLabelField from "@/module/schedule-management/weekly-schedule-management/components/job-label-field";
import { FORM_MODE } from "@/types";
import { SUB_CONTRACTOR_CREW_STATUS } from "@/module/admin-sub-contractor/types";
import { useSubContractorCrews } from "@/module/sub-contractor/hooks/useSubContractorCrew";

export const CreateSubContractorDailyJobModal = ({
	bcewJob,
	date,
	closeModal,
}: {
	bcewJob?: IWeekScheduleResponse["bcewJobs"][number];
	date: Date;
	closeModal: () => void;
}) => {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const { mutate: createDailyJobMutation, isPending } = useCreateDailyJob(user);
	const queryClient = useQueryClient();

	const {
		data,
		isPending: isCrewLoading,
		isError,
	} = useSubContractorCrews(user, subcontractorCrew, {
		crewStatus: SUB_CONTRACTOR_CREW_STATUS.ACTIVE,
	});

	const actrec = bcewJob?.schlin?.actrec || bcewJob?.srvinv?.actrec || bcewJob?.schlinExtended?.actrec;

	const form = useForm<ICreateSubContractorDailyJobFormSchema>({
		resolver: zodResolver(createSubContractorDailyJobFormSchema),
		defaultValues: {
			jobName: actrec?.jobnme,
			jobRecNum: `#${actrec?.recnum}`,
			date,
			labelIds: [legends.subContractorJob],
			subcontractorId: user?.subContractor?.id,
			subcontractorCrewId: "",
			subcontactorCrewLeaderName: "", // UI only
		},
	});

	// Crew dropdown options
	const crewOptions =
		data?.crews?.map((crew) => ({
			label: crew.name,
			value: crew.id,
		})) || [];

	// Auto-fill crew leader
	const selectedCrewId = form.watch("subcontractorCrewId");

	useEffect(() => {
		if (!selectedCrewId || !data?.crews) return;

		const selectedCrew = data.crews.find((crew) => crew.id === selectedCrewId);

		if (selectedCrew) {
			form.setValue("subcontactorCrewLeaderName", selectedCrew?.crewLeaderName || "");
		}
	}, [selectedCrewId, data, form]);

	const onSubmit = (data: ICreateSubContractorDailyJobFormSchema) => {
		if (!user?.subContractor?.id) {
			openErrorToast({ message: "User not found" });
			return;
		}

		createDailyJobMutation(
			{
				schlinId: bcewJob?.schlin?.idnum,
				srvinvId: bcewJob?.srvinv?.idnum,
				date: toMidnightDateString(data.date),

				crewLeaderId: undefined,
				taskLeaderId: undefined,
				jobEmployeeAssignments: [],

				labelIds: [legends.subContractorJob],
				subcontractorId: user?.subContractor?.id,

				subcontractorCrewId: data.subcontractorCrewId,
			},
			{
				onSuccess: async () => {
					openSuccessToast("Job created successfully");
					await queryClient.invalidateQueries({
						queryKey: ["sub-contractor-week-schedule"],
					});
					closeModal();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const isReady = !!user?.id && !!bcewJob;

	return (
		<div className="p-1">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="mb-4 flex w-full flex-col gap-4 sm:flex-row">
						<div className="flex-1">
							<FormField
								control={form.control}
								name="jobName"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<InputField label="Job Id" disabled {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex-1">
							<InputField label="Phase" disabled value={bcewJob?.schlin?.tsknme || bcewJob?.srvinv?.ordnum} />
						</div>
					</div>

					<div className="flex flex-col gap-4 sm:flex-row">
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="mb-2 text-xs font-normal text-brand-grey md:text-sm">Date</FormLabel>
									<FormControl>
										<DatePicker
											value={field.value ? new Date(field.value) : undefined}
											onChange={field.onChange}
											disabledDate={{ before: getTodayDate() }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="labelIds"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel className="!mb-2 !text-xs !font-normal !text-brand-grey md:!text-sm">Status</FormLabel>

									<FormControl>
										<div className="pointer-events-none">
											<JobLabelField onChange={field.onChange} value={field.value || []} mode={FORM_MODE.CREATE} />
										</div>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Row 3 */}
					<div className="mt-4">
						<InputField label="Sub-Contractor" value={user?.name} disabled />
					</div>

					{/* Row 4 */}
					<div className="mt-4 flex flex-col gap-4 sm:flex-row">
						{/* Crew Name */}
						<FormField
							control={form.control}
							name="subcontractorCrewId"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormControl>
										<SelectField
											label="Sub-Contractor Crew Name"
											options={crewOptions}
											value={field.value || ""}
											onValueChange={field.onChange}
											placeholder={isCrewLoading ? "Loading..." : "Select Crew Name"}
											disabled={isCrewLoading || isError}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Crew Leader */}
						<FormField
							control={form.control}
							name="subcontactorCrewLeaderName"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormControl>
										<InputField
											label="Sub-Contractor Crew Leader"
											placeholder="Crew Leader here"
											value={field.value || ""}
											disabled
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Submit */}
					<Button
						type="submit"
						variant={"filled"}
						className="mt-6 w-full"
						loading={isPending}
						disabled={!isReady || isPending}
					>
						Create
					</Button>
				</form>
			</Form>
		</div>
	);
};
