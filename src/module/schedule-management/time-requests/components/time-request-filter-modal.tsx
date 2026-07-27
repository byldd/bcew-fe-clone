"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/selectField";
import { ITimeRequestFilterProps } from "../utils/types";
import { REQUEST_STATUS_OPTIONS, ETR_REQUEST_TYPE_OPTIONS, MDTR_REQUEST_TYPE_OPTIONS } from "../utils/constants";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { tabParams } from "../utils/enums";
import { useTimeRequestsParams } from "../hooks/useTimeRequestsParams.ts";

export default function TimeRequestFilterModal({
	defaultRequestStatus,
	defaultRequestType,
	onApply,
	onClose,
}: ITimeRequestFilterProps) {
	const [requestStatus, setRequestStatus] = useState(defaultRequestStatus ?? "");
	const [requestType, setRequestType] = useState(defaultRequestType ?? "");
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const { getParams } = useTimeRequestsParams();
	const { tab } = getParams();
	const handleApply = () => {
		onApply({
			requestStatus,
			requestType,
		});
		onClose();
	};

	const handleClear = () => {
		setRequestType("");
		setRequestStatus("");
		onApply({
			requestStatus: "",
			requestType: "",
		});
		onClose();
	};

	return (
		<div className="space-y-6">
			{tab !== tabParams.FINGERPRINT_APPROVAL && (
				<div className="space-y-1">
					<Label className="text-sm text-brand-dark60">{tTimeLogs.requestType}</Label>
					<SelectField
						placeholder={tTimeLogs.selectRequestType}
						value={requestType}
						options={tab === tabParams.MIDDAY_STOP ? MDTR_REQUEST_TYPE_OPTIONS : ETR_REQUEST_TYPE_OPTIONS}
						onValueChange={setRequestType}
					/>
				</div>
			)}
			<div className="space-y-1">
				<Label className="text-sm text-brand-dark60">{tTimeLogs.requestStatus}</Label>
				<SelectField
					placeholder={tTimeLogs.selectRequestStatus}
					value={requestStatus}
					options={REQUEST_STATUS_OPTIONS}
					onValueChange={setRequestStatus}
				/>
			</div>
			<div className="flex justify-between gap-2">
				<Button variant="outline" onClick={handleClear} className="w-full">
					{tTimeLogs.clearAll}
				</Button>

				<Button variant="filled" onClick={handleApply} className="w-full">
					{tTimeLogs.apply}
				</Button>
			</div>
		</div>
	);
}
