"use client";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import TimeInput from "@/components/ui/time-input";
import FormError from "@/components/ui/form-error";
import { Switch } from "@/components/ui/switch";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTeam } from "@/module/team/hooks/useTeams";
import { getTodayDate, setTime, dateToUTCString } from "@/lib/utils/date";
import { TeamFormValues, teamSchema } from "../utils/team-form-schema";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTeamModalProps {
	onClose: () => void;
}

const TEAM_DEFAULT_TIME = {
	dayStartTime: dateToUTCString(setTime(getTodayDate(), "09:00")),
	dayEndTime: dateToUTCString(setTime(getTodayDate(), "15:30")),
};

const CreateTeamModal = ({ onClose }: CreateTeamModalProps) => {
	const createTeamMutation = useCreateTeam();
	const queryClient = useQueryClient();

	const form = useForm<TeamFormValues>({
		resolver: zodResolver(teamSchema),
		defaultValues: {
			name: "",
			dayStartTime: TEAM_DEFAULT_TIME.dayStartTime,
			dayEndTime: TEAM_DEFAULT_TIME.dayEndTime,
			isPauseAllowed: false,
		},
	});

	const handleCreateTeam = (values: TeamFormValues) => {
		createTeamMutation.mutate(values, {
			onSuccess: () => {
				openSuccessToast("Team created successfully");
				queryClient.invalidateQueries({ queryKey: ["teams"] });
				onClose();
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<div className="p-1">
			<form onSubmit={form.handleSubmit(handleCreateTeam)}>
				{/* Team Name */}
				<div>
					<InputField
						label="Team Name"
						value={form.watch("name")}
						onChange={(e) => form.setValue("name", e.target.value)}
						placeholder="Enter team name"
					/>

					<FormError error={form.formState.errors.name?.message} />
				</div>

				{/* Pause Allowed */}
				<div className="mt-4 flex items-center justify-between">
					<label className="text-sm text-brand-dark">Pause Allowed</label>

					<Controller
						name="isPauseAllowed"
						control={form.control}
						render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
					/>
				</div>

				{/* Working Hours */}
				<p className="mt-5 text-lg text-brand-grey">Team Standard Working Hours</p>

				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
					{/* Day Start Time */}
					<div>
						<p className="mb-1 text-sm text-brand-grey">Day Start Time</p>

						<Controller
							control={form.control}
							name="dayStartTime"
							render={({ field }) => (
								<TimeInput date={field.value} value={field.value} onChange={field.onChange} minuteStep={15} />
							)}
						/>

						<FormError error={form.formState.errors.dayStartTime?.message} />
					</div>

					{/* Day End Time */}
					<div>
						<p className="mb-1 text-sm text-brand-grey">Day End Time</p>

						<Controller
							control={form.control}
							name="dayEndTime"
							render={({ field }) => (
								<TimeInput date={field.value} value={field.value} onChange={field.onChange} minuteStep={15} />
							)}
						/>

						<FormError error={form.formState.errors.dayEndTime?.message} />
					</div>
				</div>

				{/* Actions */}
				<div className="mt-6 flex justify-end gap-4">
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="w-full"
						disabled={createTeamMutation.isPending}
					>
						Cancel
					</Button>

					<Button
						type="submit"
						variant="filled"
						className="w-full"
						loading={createTeamMutation.isPending}
						loadingText="Creating..."
					>
						Create Team
					</Button>
				</div>
			</form>
		</div>
	);
};

export default CreateTeamModal;
