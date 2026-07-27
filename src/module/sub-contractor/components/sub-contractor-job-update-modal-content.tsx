"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TextareaField } from "@/components/ui/textareaField";
import { OptionYesNo } from "@/utils/enums";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { dateToUTCString, getTodayDate, toFormattedDate } from "@/lib/utils/date";
import { IActrec } from "../types";
import { IJobUpdateReasons } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { formatDateToMMDDYYYY } from "@/module/schedule-management/time-logs-management/utils";
import { extractUTCDayAndTime } from "@/module/job/utils";
import { Separator } from "@radix-ui/react-select";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export interface ISubContractorJobUpdateModalContentProps {
	jobCompleted: boolean | null;
	setJobCompleted: (v: boolean | null) => void;

	completionDate: string | undefined;
	setCompletionDate: (v: string) => void;

	note: string | undefined;
	setNote: (v: string | undefined) => void;

	onSubmit: () => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;

	actrec: IActrec;

	jobUpdateReasons: IJobUpdateReasons[] | undefined;
	isMarkedAsNotReady: boolean;
}

export function SubContractorJobUpdateModalContent({
	jobCompleted,
	setJobCompleted,
	completionDate,
	setCompletionDate,
	note,
	setNote,
	actrec,
	jobUpdateReasons,
	isMarkedAsNotReady,
}: ISubContractorJobUpdateModalContentProps) {
	const showAdditionalFields = !jobCompleted;

	const today = getTodayDate();
	const maxDate = new Date(today);
	maxDate.setDate(today.getDate() + 10);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	return (
		<div className="space-y-4 overflow-x-hidden border-t px-0.5">
			<div className="mt-2 min-w-0">
				<h1 className="font-inter text-sm font-semibold capitalize text-brand-dark">
					{actrec?.jobnme}
					{
						<p className="text-sm font-normal text-brand-dark">
							{tEmployee.job} #{actrec?.recnum}
						</p>
					}
				</h1>
			</div>
			<div className="space-y-3">
				<Label className="font-inter text-sm font-medium text-brand-dark60">
					{tEmployee.jobCompletedToday} <span className="text-brand-dark60">*</span>
				</Label>
				<RadioGroup
					disabled={isMarkedAsNotReady}
					value={jobCompleted === true ? OptionYesNo.YES : jobCompleted === false ? OptionYesNo.NO : undefined}
					onValueChange={(val) => {
						if (val === OptionYesNo.YES) setJobCompleted(true);
						else if (val === OptionYesNo.NO) setJobCompleted(false);
						else setJobCompleted(null);
					}}
					className="flex flex-row space-x-24"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem
							disabled={isMarkedAsNotReady}
							value={OptionYesNo.YES}
							id="completed-yes"
							className="custom-radio"
						/>
						<Label htmlFor="completed-yes" className="font-normal text-black">
							{tEmployee.yes}
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value={OptionYesNo.NO} id="completed-no" className="custom-radio" />
						<Label htmlFor="completed-no" className="font-normal text-black">
							{tEmployee.no}
						</Label>
					</div>
				</RadioGroup>
			</div>
			{showAdditionalFields && (
				<>
					<div>
						<Label className="mb-1 font-inter text-sm text-brand-dark60">
							{tjobCards.expectedCompletionDate}
							<span className="text-brand-dark60">*</span>
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={`relative w-full justify-start border border-gray-300 bg-white text-left text-sm font-normal text-black hover:bg-gray-50 ${
										!completionDate && "text-black/70"
									}`}
								>
									{completionDate ? (
										format(toFormattedDate(completionDate), "PPP")
									) : (
										<span className="text-sm text-black/70">{tEmployee.selectDateHere}</span>
									)}
									<CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={completionDate ? new Date(completionDate) : undefined}
									onSelect={(date) => {
										if (date) setCompletionDate(dateToUTCString(date));
									}}
									disabled={{
										before: today,
										after: maxDate,
									}}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</>
			)}

			<div>
				{!jobCompleted &&
					jobUpdateReasons &&
					jobUpdateReasons?.length > 0 &&
					jobUpdateReasons.map((jobUpdate, index) => (
						<div key={index} className="space-y-1">
							<div className="flex justify-between text-xs font-medium text-brand-dark50">
								<span>{formatDateToMMDDYYYY(jobUpdate.createdAt)}</span>
								<span>{extractUTCDayAndTime(jobUpdate.createdAt)}</span>
							</div>
							<div className="flex justify-between text-xs font-medium text-brand-dark50">
								<p className="break-words text-sm font-medium text-brand-dark">{jobUpdate.reason}</p>
								<span>{jobUpdate.user?.name}</span>
							</div>

							{index !== jobUpdateReasons.length - 1 && <Separator className="!my-3 bg-brand-dark10" />}
						</div>
					))}
			</div>

			{jobCompleted === false && (
				<div className="space-y-1 pb-1">
					<TextareaField
						id="note"
						placeholder={tEmployee.typeHere}
						label={tEmployee.addNote}
						value={note || ""}
						onChange={(e) => setNote(e.target.value)}
						labelClassName="font-inter text-sm font-medium text-brand-dark60"
						className="mb-4 min-h-[60px] overflow-auto rounded-[8px] bg-brand-bgLightgrey text-sm font-normal outline-none"
					/>
				</div>
			)}
		</div>
	);
}
