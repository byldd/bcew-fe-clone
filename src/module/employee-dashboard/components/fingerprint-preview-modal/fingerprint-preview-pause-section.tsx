"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form";
import TimeInput from "@/components/ui/time-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Check, Plus, Trash } from "lucide-react";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { dateToUTCString } from "@/lib/utils/date";
import { Messages, NAMESPACE } from "@/i18n/type";
import { PauseTimes } from "../../utils/enums";
import { IFingerprintPreviewFormSchema } from "../../utils/fingerprint-preview-schema";

export function FingerprintPreviewPauseSection({
	form,
	startDate,
	tEmployee,
}: {
	form: UseFormReturn<IFingerprintPreviewFormSchema>;
	startDate: string | Date;
	tEmployee: Messages[typeof NAMESPACE.EMPLOYEE];
}) {
	const hasPause = useWatch({ control: form.control, name: "hasPause" });
	const pauseTimes = useWatch({
		control: form.control,
		name: "pauseTimes",
	}) as IFingerprintPreviewFormSchema["pauseTimes"];

	const addPauseEntry = () => {
		const newEntry: IFingerprintPreviewFormSchema["pauseTimes"][number] = {
			pauseStartTime: dateToUTCString(startDate),
			pauseEndTime: dateToUTCString(startDate),
		};
		form.setValue("pauseTimes", [...pauseTimes, newEntry], { shouldValidate: true });
	};

	const handleChangePause = (
		index: number,
		field: keyof IFingerprintPreviewFormSchema["pauseTimes"][number],
		value: string
	) => {
		if (!pauseTimes[index]) return;
		const updated = [...pauseTimes];
		updated[index] = {
			...updated[index],
			[field]: value,
		} as IFingerprintPreviewFormSchema["pauseTimes"][number];
		form.setValue("pauseTimes", updated, { shouldValidate: true });
	};

	const handlePauseDelete = (index: number) => {
		form.setValue(
			"pauseTimes",
			pauseTimes.filter((_, i) => i !== index),
			{ shouldValidate: true }
		);
	};

	return (
		<div className="space-y-1">
			<div className="flex justify-between">
				<div className="flex items-center gap-2">
					<FormField
						control={form.control}
						name="hasPause"
						render={({ field }) => (
							<Checkbox
								id="pause"
								checked={field.value}
								onCheckedChange={(val) => {
									field.onChange(!!val);
									if (!val) {
										form.setValue("pauseTimes", [], { shouldValidate: true });
										form.setValue("pauseReason", "", { shouldValidate: true });
									}
								}}
								className="flex h-4 w-4 items-center justify-center rounded border-2 border-[black] font-medium"
							>
								{field.value && <Check className="h-3 w-3 text-brand-dark" />}
							</Checkbox>
						)}
					/>
					<Label className="cursor-pointer font-inter text-xs font-normal text-brand-grey md:text-xs">
						{tEmployee.anyPauseInYourDay}
					</Label>
				</div>
				<Button
					disabled={!hasPause}
					variant="ghost"
					onClick={addPauseEntry}
					className="h-10 rounded-[4px] text-xs font-normal"
				>
					<Plus /> {tEmployee.addPause}
				</Button>
			</div>
			<div className="rounded-[10px] border border-blue-200 bg-blue-50 p-2 text-[10px]">
				<p className="font-medium text-gray-700">{tEmployee.note}:</p>
				<ul className="list-disc pl-4 font-normal text-gray-800">
					<li>{tEmployee.lunchAutoDeducted}</li>
				</ul>
			</div>

			{hasPause && (
				<div className="space-y-3 rounded-md pt-2">
					<p className="font-inter text-sm font-medium text-brand-dark60">{tEmployee.enterPauseTimings}</p>

					{pauseTimes?.map((pause, index) => (
						<div key={index} className="flex items-center gap-3">
							<div className="w-full flex-1">
								<Label className="font-inter text-xs font-normal text-brand-grey">{tEmployee.from}</Label>
								<TimeInput
									value={pause.pauseStartTime}
									onChange={(val) => handleChangePause(index, PauseTimes.PAUSE_START_TIME, val)}
									date={pause.pauseStartTime}
								/>
							</div>
							<div className="w-full flex-1">
								<Label className="font-inter text-xs font-normal text-brand-grey">{tEmployee.to}</Label>
								<TimeInput
									value={pause.pauseEndTime || dateToUTCString(startDate)}
									onChange={(val) => handleChangePause(index, PauseTimes.PAUSE_END_TIME, val)}
									date={pause.pauseEndTime || dateToUTCString(startDate)}
								/>
							</div>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Trash className="mt-6 h-4 w-4 cursor-pointer" onClick={() => handlePauseDelete(index)} />
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-left text-[8px]">{tEmployee.deletePause}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					))}

					<div className="space-y-0.5">
						<FormLabelRequired label={tEmployee.pauseReasonRequired} required />
						<div className="px-0.5">
							<FormField
								control={form.control}
								name="pauseReason"
								render={({ field }) => (
									<Textarea value={field.value} onChange={field.onChange} placeholder={tEmployee.typeHere} />
								)}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
