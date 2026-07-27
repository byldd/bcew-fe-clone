"use client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { RequestTypeEnum } from "../../enums/request-type";
import { REQUEST_TYPE_OPTIONS } from "../../constants/request-type-options";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type Props = {
	onRequestTypeChange: (value: RequestTypeEnum) => void;
};

export default function AddNewJobForm({ onRequestTypeChange }: Props) {
	const [requestType, setRequestType] = useState<RequestTypeEnum | "">("");
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<div className="space-y-4">
			{/* Type of Request */}
			<div className="space-y-1">
				<Label>{tEmployee.typeOfRequest}</Label>

				<Select
					value={requestType}
					onValueChange={(value) => {
						setRequestType(value as RequestTypeEnum);
						onRequestTypeChange(value as RequestTypeEnum);
					}}
				>
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

			{/* Reason */}
			<div className="space-y-1">
				<Label>{tEmployee.selectReason}</Label>
				<Textarea placeholder={tEmployee.typeHere} />
			</div>
		</div>
	);
}
