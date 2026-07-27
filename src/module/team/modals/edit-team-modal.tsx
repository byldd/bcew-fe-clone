"use client";

import { Button } from "@/components/ui/button";
import TimeInput from "@/components/ui/time-input";
import { Switch } from "@/components/ui/switch";
import { Controller, useForm } from "react-hook-form";
import { ITeam, IUpdateTeamPayload } from "@/module/team/types";
import { useUpdateTeam } from "@/module/team/hooks/useTeams";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { InputField } from "@/components/ui/inputField";
import { TEAM_NAME } from "@/utils/enums";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
	team: ITeam;
	onClose: () => void;
}

const EditTeamModal = ({ team, onClose }: Props) => {
	const mutation = useUpdateTeam(team.id);
	const queryClient = useQueryClient();

	const { control, handleSubmit } = useForm<IUpdateTeamPayload>({
		defaultValues: {
			name: team.name,
			dayStartTime: team.dayStartTime,
			dayEndTime: team.dayEndTime,
			isPauseAllowed: team.isPauseAllowed,
		},
	});

	const onSubmit = (data: IUpdateTeamPayload) => {
		mutation.mutate(data, {
			onSuccess: () => {
				openSuccessToast("Team updated successfully");

				queryClient.invalidateQueries({
					queryKey: ["teams"],
				});
				queryClient.invalidateQueries({
					queryKey: ["team", team.id],
				});
				onClose();
			},
			onError: (error) => {
				openErrorToast({
					error,
				});
			},
		});
	};

	const isDefaultTeams = Object.values(TEAM_NAME).includes(team?.name as TEAM_NAME);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			<Controller
				name="name"
				control={control}
				rules={{
					required: "Team name is required",
				}}
				render={({ field, fieldState }) => (
					<InputField
						label="Team Name"
						placeholder="Enter team name"
						value={field.value}
						onChange={field.onChange}
						error={fieldState.error?.message}
						disabled={isDefaultTeams}
					/>
				)}
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Controller
					name="dayStartTime"
					control={control}
					render={({ field }) => (
						<TimeInput value={field.value} date={field.value} onChange={field.onChange} minuteStep={15} />
					)}
				/>

				<Controller
					name="dayEndTime"
					control={control}
					render={({ field }) => (
						<TimeInput value={field.value} date={field.value} onChange={field.onChange} minuteStep={15} />
					)}
				/>
			</div>

			<Controller
				name="isPauseAllowed"
				control={control}
				render={({ field }) => (
					<div className="flex items-center justify-between rounded-xl border p-4">
						<div>
							<h4 className="font-medium">Pause Allowed</h4>
							<p className="text-sm text-brand-dark50">Enable pause for team</p>
						</div>

						<Switch checked={field.value} onCheckedChange={field.onChange} />
					</div>
				)}
			/>

			<div className="flex gap-2 pt-4">
				<Button type="button" variant="outline" className="w-full" onClick={onClose}>
					Cancel
				</Button>

				<Button type="submit" variant="filled" className="w-full" loading={mutation.isPending}>
					Update
				</Button>
			</div>
		</form>
	);
};

export default EditTeamModal;
