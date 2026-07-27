import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/selectField";
import { InputField } from "@/components/ui/inputField";
import { IChangeVehicleModalProps } from "../types";
import { vehicleChangeOptions } from "../constants";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Label } from "@/components/ui/label";

export function ChangeVehicleModalContent({ previousVehicleNumber, onSuccess, onCancel }: IChangeVehicleModalProps) {
	const [reason, setReason] = useState("");
	const [currentVehicle, setCurrentVehicle] = useState("");
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<form
			className="space-y-6 px-0.5"
			onSubmit={(e) => {
				e.preventDefault();
				onSuccess(currentVehicle, reason);
			}}
		>
			<div>
				<InputField
					disabled={true}
					label={tEmployee.previousVehicleNumber}
					value={previousVehicleNumber}
					placeholder={tEmployee.enterVehicleNumber}
					readOnly
				/>
			</div>
			<div className="space-y-1">
				<Label className="font-inter text-sm font-normal text-brand-grey">
					{tEmployee.reasonForChangeRequired}
					<span>*</span>
				</Label>
				<SelectField
					placeholder={tEmployee.selectReasonForChange}
					options={vehicleChangeOptions.map((option) => ({ label: option, value: option }))}
					value={reason}
					onValueChange={setReason}
				/>
			</div>
			<div>
				<InputField
					label={tEmployee.currentVehicleNumber}
					placeholder={tEmployee.enterNewVehicleNumber}
					value={currentVehicle}
					onChange={(e) => setCurrentVehicle(e.target.value)}
				/>
				<span className="ml-1 text-xs text-brand-dark50">{tEmployee.vehicleNumberStandardFormat}</span>
			</div>
			<div className="flex gap-2 pt-2">
				<Button type="button" variant="outline" onClick={onCancel} className="w-full">
					{tEmployee.cancel}
				</Button>
				<Button variant={"filled"} type="submit" disabled={!reason || !currentVehicle} className="w-full">
					{tEmployee.update}
				</Button>
			</div>
		</form>
	);
}
