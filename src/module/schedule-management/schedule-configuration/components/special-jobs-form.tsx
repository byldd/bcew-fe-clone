import React, { useEffect, useMemo, useState } from "react";
import { useTeams } from "@/module/team/hooks/useTeams";
import { useForm } from "react-hook-form";
import { ISpecialJobFormSchema, specialJobFormSchema } from "../utils/special-job-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Button } from "@/components/ui/button";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { MultiSelect } from "@/components/ui/multi-select";
import { InputField } from "@/components/ui/inputField";
import { CgAddR } from "react-icons/cg";
import { useGetSpecialJobs } from "../../weekly-schedule-management/hooks/useScheduleConfig";
import SpecialJobRow from "./special-job-row";
import { Spinner } from "@/components/ui/spinner";
import { Form } from "@/components/ui/form";
import { useUpdateSpecialJobs } from "../hooks/useScheduleConfig";
import ZoneSelect from "./zone-selec";

const SpecialJobForm = () => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { data: specialJobsData, isLoading: isLoadingSpecialJobs } = useGetSpecialJobs();
	const { mutate: updateSpecialJobs, isPending } = useUpdateSpecialJobs();

	const [isAdding, setIsAdding] = useState(false);
	const [newSpecialJob, setNewSpecialJob] = useState<{
		name: string;
		teamId: string;
		teamIds: string[];
		zones: { geoTabId: string; name: string; address: string; isCurrent?: boolean }[];
	}>({
		name: "",
		teamId: "",
		teamIds: [],
		zones: [],
	});

	const { data: teams } = useTeams();

	const teamOptions = useMemo(() => {
		return (
			teams?.map((team) => ({
				value: team.id,
				label: team.name,
			})) || []
		);
	}, [teams]);

	const form = useForm<ISpecialJobFormSchema>({
		resolver: zodResolver(specialJobFormSchema),
		defaultValues: {
			specialJobs: [],
		},
	});

	useEffect(() => {
		form.setValue(
			"specialJobs",
			specialJobsData?.map((specialJob) => ({
				id: specialJob.id,
				name: specialJob.name,
				isVisible: specialJob.isVisible,
				isDeleted: specialJob.isDeleted,
				teamIds: specialJob?.teams?.map((team) => team.teamId) || [],
				sequence: specialJob.sequence,
				zones:
					specialJob?.specialJobZones?.map((zone) => {
						return {
							geoTabId: zone?.zoneGeoTabId,
							name: zone?.zone?.name,
							address: zone?.zone?.address || "",
							isCurrent: zone?.isCurrent,
						};
					}) || [],
			})) || []
		);
	}, [specialJobsData, form]);

	const { specialJobs } = form.watch();

	const selectedZoneFromAllJobs = specialJobs.flatMap((job) => job.zones)?.flat();

	const pushNewSpecialJob = () => {
		if (
			specialJobs?.some(
				(specialJob) => specialJob.name?.trim().toLowerCase() === newSpecialJob.name.trim().toLowerCase()
			)
		) {
			openErrorToast({ message: tschedule.specialJobAlreadyExists });
			return;
		}
		form.setValue("specialJobs", [
			...(specialJobs || []),
			{
				name: newSpecialJob.name.trim().toLowerCase(),
				isVisible: true,
				isDeleted: false,
				sequence: specialJobs?.length + 1,
				teamIds: newSpecialJob.teamIds,
				zones: newSpecialJob.zones,
			},
		]);

		setIsAdding(false);
		setNewSpecialJob({ name: "", teamId: "", teamIds: [], zones: [] });
	};

	const onSubmit = (data: ISpecialJobFormSchema) => {
		updateSpecialJobs(
			{
				specialJobs: data.specialJobs?.map((specialJob, index) => ({
					...specialJob,
					sequence: specialJob.sequence || index + 1,
					teamIds: specialJob.teamIds || [],
					zones: specialJob.zones || [],
				})),
			},
			{
				onSuccess: () => {
					openSuccessToast(tschedule.specialJobUpdatedSuccessfully);
				},
				onError: (error) => {
					openErrorToast({ message: error.message });
				},
			}
		);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="space-y-4">
					<div className="text-brand-grey">
						<p className="text-lg font-semibold text-brand-dark">{tschedule.onScheduleJobManagement}</p>
						<p className="text-sm text-brand-grey">{tschedule.manageOnScheduleJobsHint}</p>
					</div>

					<div className="flex flex-col gap-2">
						{isLoadingSpecialJobs && (
							<div className="flex items-center justify-center">
								<Spinner />
							</div>
						)}
						{specialJobs
							?.filter((specialJob) => !specialJob.isDeleted)
							?.sort((a, b) => (a?.sequence || 0) - (b?.sequence || 0))
							?.map((specialJob, index) => (
								<SpecialJobRow
									teams={teams || []}
									key={`${specialJob.name}-${index}`}
									specialJob={specialJob}
									index={index}
								/>
							))}
					</div>

					<div className="my-4 w-full">
						{!isAdding ? (
							<Button className="!mt-4" size="sm" type="button" variant="filled" onClick={() => setIsAdding(true)}>
								<CgAddR /> {tschedule.addNew}
							</Button>
						) : (
							<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
								<div className="w-full flex-1 items-center gap-2 space-y-2">
									<InputField
										label={tschedule.specialJobName}
										placeholder={tschedule.enterJobName}
										value={newSpecialJob.name}
										onChange={(e) => setNewSpecialJob({ ...newSpecialJob, name: e.target.value })}
									/>

									<MultiSelect
										label={tschedule.selectTeams}
										placeholder={tschedule.selectTeams}
										options={teamOptions.map((item) => ({
											id: item.value,
											name: item.label,
										}))}
										selected={
											newSpecialJob.teamIds.map((item) => ({
												id: item,
												name: teamOptions.find((option) => option.value === item)?.label || "",
											})) || []
										}
										onChange={(val) =>
											setNewSpecialJob({ ...newSpecialJob, teamIds: val.map((item) => item.id) || [] })
										}
									/>

									<ZoneSelect
										selected={
											newSpecialJob.zones.map((zone) => ({
												...zone,
												defaultValue:
													selectedZoneFromAllJobs.find((item) => item?.geoTabId === zone.geoTabId)?.address || "",
											})) || []
										}
										onChange={(val) => setNewSpecialJob({ ...newSpecialJob, zones: val })}
									/>
								</div>
								<div className="flex justify-end gap-2 sm:mb-2 sm:flex-col">
									<Button
										className="h-10 flex-1 sm:flex-none"
										type="button"
										variant="filled"
										disabled={!newSpecialJob.name || newSpecialJob.teamIds.length === 0}
										onClick={pushNewSpecialJob}
									>
										<IoMdCheckmark />
									</Button>
									<Button
										className="h-10 flex-1 sm:flex-none"
										type="button"
										variant="outline"
										onClick={() => setIsAdding(false)}
									>
										<AiOutlineClose />
									</Button>
								</div>
							</div>
						)}
					</div>

					<div>
						<Button disabled={isPending} className="w-full" type="submit" variant={"filled"}>
							{tschedule.saveConfiguration}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default SpecialJobForm;
