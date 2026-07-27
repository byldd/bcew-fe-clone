import React, { useMemo, useState } from "react";
import { InputField } from "@/components/ui/inputField";
import { ChevronUp, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";
import { MultiSelect } from "@/components/ui/multi-select";
import { ISpecialJobFormSchema } from "../utils/special-job-form";
import { ITeam } from "@/module/team/types";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import ZoneSelect from "./zone-selec";

const SpecialJobRow = ({
	specialJob,
	index,
	teams,
}: {
	specialJob: ISpecialJobFormSchema["specialJobs"][number];
	index: number;
	teams: ITeam[];
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const formContext = useFormContext<ISpecialJobFormSchema>();
	const teamOptions = useMemo(() => {
		return (
			teams?.map((team) => ({
				value: team.id,
				label: team.name,
			})) || []
		);
	}, [teams]);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { specialJobs } = formContext.watch();

	const selectedZoneFromAllJobs = specialJobs.flatMap((job) => job.zones)?.flat();

	return (
		<div key={`${specialJob.name}-${index}`}>
			<div className="flex w-full items-center justify-between gap-2">
				<p className="capitalize">{specialJob.name || "--"}</p>
				<div className="flex items-center gap-2">
					{!isEditing ? (
						<Pencil className="h-4 w-4" onClick={() => setIsEditing(true)} />
					) : (
						<ChevronUp className="h-4 w-4" onClick={() => setIsEditing(false)} />
					)}
					<Switch
						checked={specialJob.isVisible}
						onCheckedChange={(checked) => formContext.setValue(`specialJobs.${index}.isVisible`, checked)}
					/>
				</div>
			</div>
			{isEditing && (
				<div>
					<div className="flex flex-col gap-2 pt-2 sm:flex-row">
						<FormField
							control={formContext.control}
							name={`specialJobs.${index}.name`}
							render={({ field }) => {
								return (
									<FormItem className="w-full">
										<FormControl>
											<InputField
												className="w-full flex-1 capitalize"
												label={tschedule.specialJobName}
												placeholder={tschedule.enterJobName}
												value={field.value}
												onChange={(e) => {
													e.preventDefault();
													e.stopPropagation();
													field.onChange(e.target.value.toLowerCase().trim());
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>

						<FormField
							control={formContext.control}
							name={`specialJobs.${index}.teamIds`}
							render={({ field }) => {
								return (
									<FormItem className="w-full">
										<FormControl>
											<MultiSelect
												label={tschedule.selectTeams}
												placeholder={tschedule.selectTeams}
												options={teamOptions.map((item) => ({
													id: item.value,
													name: item.label,
												}))}
												selected={
													specialJob?.teamIds?.map((item) => ({
														id: item,
														name: teamOptions.find((option) => option.value === item)?.label || "",
													})) || []
												}
												onChange={(val) => field.onChange(val.map((item) => item.id) || [])}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					</div>

					<FormField
						control={formContext.control}
						name={`specialJobs.${index}.zones`}
						render={({ field }) => {
							return (
								<FormItem className="w-full">
									<FormControl>
										<ZoneSelect
											selected={
												field.value?.map((zone) => ({
													...zone,
													defaultValue:
														selectedZoneFromAllJobs.find((item) => item?.geoTabId === zone.geoTabId)?.address || "",
												})) || []
											}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default SpecialJobRow;
