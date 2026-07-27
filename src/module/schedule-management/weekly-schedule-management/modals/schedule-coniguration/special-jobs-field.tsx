import React, { useMemo, useState } from "react";
import { IUpdateScheduleConfigFormSchema } from "../../utils/schedule-config-form";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { CgAddR } from "react-icons/cg";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { openErrorToast } from "@/components/toast";
import { useTeams } from "@/module/team/hooks/useTeams";
import SpecialJobRow from "./special-job-row";
import { MultiSelect } from "@/components/ui/multi-select";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import ZoneSelect from "@/module/schedule-management/schedule-configuration/components/zone-selec";

const SpecialJobsField = () => {
	const formContext = useFormContext<IUpdateScheduleConfigFormSchema>();
	const { specialJobs } = formContext.watch();

	const { data: teams } = useTeams();

	const teamOptions = useMemo(() => {
		return (
			teams?.map((team) => ({
				value: team.id,
				label: team.name,
			})) || []
		);
	}, [teams]);

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

	const selectedZoneFromAllJobs = specialJobs?.flatMap((job) => job.zones)?.flat();

	const pushNewSpecialJob = () => {
		if (
			specialJobs?.some(
				(specialJob) => specialJob.name?.trim().toLowerCase() === newSpecialJob.name.trim().toLowerCase()
			)
		) {
			openErrorToast({ message: tschedule.specialJobAlreadyExists });
			return;
		}
		formContext.setValue("specialJobs", [
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
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<div>
			<div className="mb-2 text-brand-grey">
				<p className="text-base font-medium">{tschedule.onScheduleJobManagement}</p>
				<p className="text-sm text-brand-grey">{tschedule.manageOnScheduleJobsHint}</p>
			</div>
			<div className="flex flex-col gap-2">
				{specialJobs
					?.filter((specialJob) => !specialJob.isDeleted)
					?.sort((a, b) => (a?.sequence || 0) - (b?.sequence || 0))
					?.map((specialJob, index) => (
						<SpecialJobRow key={`${specialJob.name}-${index}`} specialJob={specialJob} index={index} />
					))}
			</div>

			<div className="my-4 w-full">
				{!isAdding ? (
					<Button className="!mt-4" size="sm" type="button" variant="filled" onClick={() => setIsAdding(true)}>
						<CgAddR /> {tschedule.addNew}
					</Button>
				) : (
					<div className="flex w-full items-end gap-2">
						<div className="w-full flex-1 items-center gap-2 space-y-3">
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
								onChange={(val) => setNewSpecialJob({ ...newSpecialJob, teamIds: val.map((item) => item.id) || [] })}
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
						<div className="flex gap-2">
							<Button
								className="h-10"
								type="button"
								variant="filled"
								disabled={!newSpecialJob.name || newSpecialJob.teamIds.length === 0}
								onClick={pushNewSpecialJob}
							>
								<IoMdCheckmark />
							</Button>
							<Button className="h-10" type="button" variant="outline" onClick={() => setIsAdding(false)}>
								<AiOutlineClose />
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SpecialJobsField;
