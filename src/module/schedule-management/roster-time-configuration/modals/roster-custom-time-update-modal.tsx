"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IRoster, IUpdateRosterTimePayload } from "@/module/schedule-management/roster-time-configuration/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	RosterTimeForm,
	rosterTimeSchema,
} from "@/module/schedule-management/roster-time-configuration/utils/roster-time-schema";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { Label } from "@/components/ui/label";
import TimeInput from "@/components/ui/time-input";
import { dateToUTCString } from "@/lib/utils/date";

interface RosterCustomTimeUpdateModalProps {
	onClose: () => void;
	employeeName: string;
	roster: IRoster;
	onSave?: (payload: IUpdateRosterTimePayload) => Promise<void> | void;
	isPastDate: boolean;
}

const RosterCustomTimeUpdateModal: React.FC<RosterCustomTimeUpdateModalProps> = ({
	onClose,
	employeeName,
	roster,
	onSave,
	isPastDate,
}) => {
	const form = useForm<RosterTimeForm>({
		resolver: zodResolver(rosterTimeSchema),
		defaultValues: {
			dayStartTime: "",
			dayEndTime: "",
			applyWholeWeek: false,
		},
	});

	useEffect(() => {
		if (roster) {
			form.reset({
				dayStartTime: "",
				dayEndTime: "",
				applyWholeWeek: false,
			});
		}
	}, [roster, form]);

	const handleSave = async (values: RosterTimeForm) => {
		const payload = {
			timeSource: TimeSource.CUSTOM,
			dayStartTime: dateToUTCString(values.dayStartTime),
			dayEndTime: dateToUTCString(values.dayEndTime),
			isAppliedForWholeWeek: values.applyWholeWeek,
		};

		if (onSave) {
			onSave(payload);
			onClose();
		}
	};

	return (
		<div className="p-2">
			{/* Employee Name */}
			<div className="mb-4">
				<p className="text-base text-gray-500">Employee Name</p>
				<p className="text-base font-bold">{employeeName}</p>
			</div>

			{/* Form */}
			<form onSubmit={form.handleSubmit(handleSave)}>
				<div className="my-6 grid grid-cols-2 gap-4">
					{/* Start Time */}
					<Controller
						control={form.control}
						name="dayStartTime"
						render={({ field }) => (
							<div className="space-y-1">
								<Label>Day Start Time</Label>

								<TimeInput
									value={field.value}
									date={dateToUTCString(roster?.date)}
									onChange={field.onChange}
									minuteStep={15}
								/>

								{form?.formState?.errors?.dayStartTime && (
									<p className="mt-1 text-sm text-red-500">{form?.formState?.errors?.dayStartTime?.message}</p>
								)}
							</div>
						)}
					/>

					{/* End Time */}
					<Controller
						control={form.control}
						name="dayEndTime"
						render={({ field }) => (
							<div className="space-y-1">
								<Label>Day End Time</Label>

								<TimeInput
									value={field.value}
									date={dateToUTCString(roster?.date)}
									onChange={field.onChange}
									minuteStep={15}
								/>

								{form?.formState?.errors?.dayEndTime && (
									<p className="mt-1 text-sm text-red-500">{form.formState.errors.dayEndTime?.message}</p>
								)}
							</div>
						)}
					/>
				</div>

				{/* Apply whole week checkbox */}
				{!isPastDate && (
					<div className="mb-6 flex items-center gap-2">
						<Controller
							control={form.control}
							name="applyWholeWeek"
							render={({ field }) => (
								<>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									<label className="text-sm text-gray-700">Apply for whole week</label>
								</>
							)}
						/>
					</div>
				)}

				{/* Footer Buttons */}
				<div className="flex justify-between gap-4">
					<Button type="button" onClick={onClose} className="w-full" variant="outline">
						Cancel
					</Button>
					<Button type="submit" className="w-full" variant="filled">
						Save
					</Button>
				</div>
			</form>
		</div>
	);
};

export default RosterCustomTimeUpdateModal;
