"use client";

import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TimeInput from "@/components/ui/time-input";
import { Check } from "lucide-react";
import { IFingerprintLogPair } from "@/module/matching-finger/utils/fingerprint-log-pairs";
import { IEmployeeScheduleItem } from "../../types";
import { IFingerprintPreviewFormSchema } from "../../utils/fingerprint-preview-schema";

export function FingerprintPreviewStopItem({
	form,
	index,
	job,
	date,
	pairs,
	didNotWorked,
	onSelectPair,
	onDidNotWorkToggle,
	disabled = false,
}: {
	form: UseFormReturn<IFingerprintPreviewFormSchema>;
	index: number;
	job: IEmployeeScheduleItem;
	date: string | Date;
	pairs: IFingerprintLogPair[];
	didNotWorked: boolean | undefined;
	onSelectPair: (index: number, assignmentId: string, pairId: string) => void;
	onDidNotWorkToggle: (index: number, assignmentId: string, checked: boolean) => void;
	disabled: boolean;
}) {
	const jobName = `${job.jobDailyRecord.jobnme}${job.jobDailyRecord.tsknme ? ` (${job.jobDailyRecord.tsknme})` : ""}`;

	return (
		<div className="space-y-3 rounded-[10px] border border-brand-bgLightgrey p-3">
			<div className="flex items-center justify-between">
				<p className="text-sm font-semibold text-brand-dark">
					Stop {index + 1} - {jobName}
				</p>
				<div className="flex items-center gap-2">
					<FormField
						control={form.control}
						name={`stops.${index}.didNotWorked`}
						render={({ field }) => (
							<Checkbox
								id={`fp-dnw-${job.assignmentId}`}
								checked={field.value}
								onCheckedChange={(val) => onDidNotWorkToggle(index, job.assignmentId, !!val)}
								className="flex h-4 w-4 items-center justify-center rounded border-2 border-[black]"
								disabled={disabled}
							>
								{field.value && <Check className="h-3 w-3 text-brand-dark" />}
							</Checkbox>
						)}
					/>
					<Label htmlFor={`fp-dnw-${job.assignmentId}`} className="cursor-pointer text-xs font-normal text-brand-grey">
						Did Not Work
					</Label>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				<FormField
					control={form.control}
					name={`stops.${index}.startTime`}
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-xs font-normal text-brand-grey">Start Time*</FormLabel>
							<FormControl>
								<TimeInput
									value={field.value ?? ""}
									date={date}
									disabled={didNotWorked || disabled}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={`stops.${index}.endTime`}
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-xs font-normal text-brand-grey">End Time*</FormLabel>
							<FormControl>
								<TimeInput
									value={field.value ?? ""}
									date={date}
									disabled={didNotWorked || disabled}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={`stops.${index}.selectedPairId`}
					render={({ field }) => (
						<FormItem className="col-span-2 sm:col-span-1">
							<FormLabel className="text-xs font-normal text-brand-grey">Select Fingerprint Log</FormLabel>
							<FormControl>
								<Select
									value={field.value ?? undefined}
									onValueChange={(value) => onSelectPair(index, job.assignmentId, value)}
									disabled={didNotWorked || disabled}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a fingerprint log" />
									</SelectTrigger>
									<SelectContent>
										{pairs.map((pair) => (
											<SelectItem key={pair.id} value={pair.id}>
												{pair.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
