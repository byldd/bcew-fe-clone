"use client";
import React, { useEffect } from "react";
import { IDayTimeProps } from "../types/schedule-interface";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useTeams, useUpdateTeams } from "@/module/team/hooks/useTeams";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	teamsFormSchema,
	TeamsFormValues,
} from "@/module/schedule-management/weekly-schedule-management/utils/team-time-form-schema";
import TimeInput from "@/components/ui/time-input";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const DayTimeConfigurationModal: React.FC<IDayTimeProps> = ({ onClose }) => {
	const { data: teams, isLoading } = useTeams();
	const { mutate: updateTeams, isPending: isUpdating } = useUpdateTeams();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const form = useForm<TeamsFormValues>({
		resolver: zodResolver(teamsFormSchema),
		defaultValues: { teams: [] },
	});

	useEffect(() => {
		if (teams) {
			form.reset({
				teams: teams.map((t) => ({
					id: t.id,
					name: t.name,
					dayStartTime: t.dayStartTime,
					dayEndTime: t.dayEndTime,
					isPauseAllowed: t.isPauseAllowed ?? false,
				})),
			});
		}
	}, [teams, form]);

	const handleSave = (values: TeamsFormValues) => {
		const payload = values.teams.map((team) => ({
			id: team.id,
			name: team.name,
			dayStartTime: team.dayStartTime,
			dayEndTime: team.dayEndTime,
			isPauseAllowed: team.isPauseAllowed,
		}));

		updateTeams(payload, {
			onSuccess: () => {
				openSuccessToast(tschedule.teamTimesUpdatedSuccessfully);
				onClose();
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	if (isLoading) return <Spinner />;

	return (
		<div className="p-1">
			<p className="mb-6 font-inter text-lg text-brand-grey"> {tschedule.configureTeamWorkingHours}</p>

			<form onSubmit={form.handleSubmit(handleSave)}>
				{form.watch("teams").map((team, index) => (
					<div key={team.id} className="mb-6">
						<p className="mb-2 font-inter text-base font-medium text-brand-dark60">
							{team.name} {tschedule.team}
						</p>
						<div className="mb-4 grid w-full min-w-full grid-cols-2 gap-4">
							<Controller
								control={form.control}
								name={`teams.${index}.dayStartTime`}
								render={({ field }) => (
									<div>
										<TimeInput value={field.value} date={field.value} onChange={field.onChange} minuteStep={15} />
										{form.formState.errors.teams?.[index]?.dayStartTime && (
											<p className="mt-1 text-sm text-red-500">
												{form.formState.errors.teams[index]?.dayStartTime?.message}
											</p>
										)}
									</div>
								)}
							/>

							<Controller
								control={form.control}
								name={`teams.${index}.dayEndTime`}
								render={({ field }) => (
									<div>
										<TimeInput value={field.value} date={field.value} onChange={field.onChange} minuteStep={15} />
										{form.formState.errors.teams?.[index]?.dayEndTime && (
											<p className="mt-1 text-sm text-red-500">
												{form.formState.errors.teams[index]?.dayEndTime?.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>

						{/* Checkbox for Pause */}
						<div className="flex items-center gap-2">
							<Controller
								control={form.control}
								name={`teams.${index}.isPauseAllowed`}
								render={({ field }) => (
									<>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
										<label className="text-sm text-brand-dark">{tschedule.includePauseTimeForTeam}</label>
									</>
								)}
							/>
						</div>
					</div>
				))}

				<Button type="submit" className="w-full" variant="filled" disabled={isUpdating} loading={isUpdating}>
					{tCommon.saveChanges}
				</Button>
			</form>
		</div>
	);
};

export default DayTimeConfigurationModal;
