"use client";
import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AddNewStopBlock } from "./add-new-stop-block";
import { RequestTypeEnum, StopType } from "../../enums/request-type";
import { REQUEST_TYPE_OPTIONS } from "../../constants/request-type-options";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type Props = {
	date: Date;
	roster?: {
		dayStartTime?: string;
		dayEndTime?: string;
		extendedApprovedStartTime?: string;
		extendedApprovedEndTime?: string;
	};
	onClose: () => void;
	onSuccess: () => void;
};

export default function AddNewJobModal({ date, onClose }: Props) {
	const [requestType, setRequestType] = useState<RequestTypeEnum | null>(null);
	const [stopType, setStopType] = useState<StopType>(StopType.PROJECT);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<div className="flex max-h-[100vh] flex-col px-1">
			{/* Header */}
			<div className="mt-1 space-y-2">
				<p className="text-xs text-brand-dark60">{tEmployee.requestOnlyInsideRosterTime}</p>

				<p className="text-sm font-medium text-brand-dark60">
					{tEmployee.date}: <span className="text-brand-dark">{format(date, "dd/MM/yyyy")}</span>
				</p>

				<p className="text-sm font-medium text-brand-dark60">
					{tEmployee.rosterTime} : <span className="text-brand-dark"></span>
				</p>
			</div>

			<Separator className="my-4" />

			{/* Form */}
			<div className="flex-1 space-y-4">
				{/* Type of request */}
				<div className="space-y-1">
					<Label className="text-xs text-brand-grey">
						{tEmployee.typeOfRequest}
						<span className="text-brand-grey">*</span>
					</Label>

					<Select onValueChange={(val) => setRequestType(val as RequestTypeEnum)}>
						<SelectTrigger>
							<SelectValue placeholder={tEmployee.selectType} />
						</SelectTrigger>

						<SelectContent>
							{REQUEST_TYPE_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Add New Stop Fields */}
				{requestType === RequestTypeEnum.ADD_NEW_STOP && (
					<>
						<div className="space-y-2">
							<Label className="text-xs text-brand-grey">Select Stop Type</Label>

							<RadioGroup
								value={stopType}
								onValueChange={(val) => setStopType(val as StopType)}
								className="flex gap-10"
							>
								<div className="flex items-center gap-2">
									<RadioGroupItem value={StopType.PROJECT} className="mb-2" />
									<Label className="text-xs text-brand-dark">{tEmployee.project}</Label>
								</div>

								<div className="flex items-center gap-2">
									<RadioGroupItem value={StopType.SPECIAL} className="mb-2" />
									<Label className="text-xs text-brand-dark">{tEmployee.specialJob}</Label>
								</div>
							</RadioGroup>
						</div>

						<AddNewStopBlock stopType={stopType} />
					</>
				)}
			</div>

			{/* Reason */}
			<div className="my-3 space-y-1">
				<Label className="text-xs text-brand-grey">Reason*</Label>
				<Textarea placeholder="Type here" className="rounded-[8px]" />
			</div>

			{/* Time Section */}
			<div className="flex gap-2">
				<div className="flex-1">
					<Label className="text-sm text-brand-grey">Start Time</Label>
					{/* to be added */}
					{/* <TimeInput /> */}
				</div>
				<div className="flex-1">
					<Label className="text-sm text-brand-grey">End Time</Label>
					{/* to be added */}
					{/* <TimeInput /> */}
				</div>
			</div>

			<Separator className="my-4" />

			{/* Footer */}
			<div className="flex flex-col gap-3">
				<Button variant="outline" onClick={onClose}>
					Cancel
				</Button>

				<Button variant="filled" disabled={!requestType}>
					Send Request
				</Button>
			</div>
		</div>
	);
}
