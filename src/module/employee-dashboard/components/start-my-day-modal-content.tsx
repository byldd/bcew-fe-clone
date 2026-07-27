"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { InputField } from "@/components/ui/inputField";
import { openErrorToast } from "@/components/toast";
import { IStartDayModalProps } from "../types";
import { useUpdateEmployeeVehicle } from "@/module/job/hooks/useEmployeeSchedule";
import { useEffect, useState } from "react";
import { SelectField } from "@/components/ui/selectField";
import { vehicleChangeOptions } from "../constants";
import useAuthStore from "@/store/auth-store";
import { TEAM_NAME } from "@/utils/enums";
import { dateToUTCString } from "@/lib/utils/date";
import { useQueryClient } from "@tanstack/react-query";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";

export function StartDayModalContent({
	vehicleNumber,
	setVehicleNumber,
	setShowStartDayModal,
	setShowEndDayModal,
	vehicleData,
}: IStartDayModalProps) {
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const [isVehicleEditing, setIsVehicleEditing] = useState(false);
	const { user } = useAuthStore((state) => state);
	const { mutate: updateVehicle, isPending: isVehiclePending } = useUpdateEmployeeVehicle();
	const [vehicleChangeNote, setVehicleChangeNote] = useState<string>("");
	const queryClient = useQueryClient();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const handleUpdateVehicle = (licenseNumber: string | undefined) => {
		if (licenseNumber) {
			return updateVehicle(
				{
					licenseNumber,
					notes: vehicleChangeNote,
					assignTime: dateToUTCString(startDate),
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["employee-vehicle"] });
						queryClient.invalidateQueries({ queryKey: ["employee-day-time-technician"] });
						setShowStartDayModal(false);
						setShowEndDayModal(true);
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		} else {
			setShowStartDayModal(false);
			setShowEndDayModal(true);
		}
	};

	const handleStart = () => {
		if (isVehicleEditing && vehicleNumber === vehicleData?.[0]?.Truck_Number) {
			openErrorToast({ message: tEmployee.enterNewVehicle });
			return;
		} else {
			handleUpdateVehicle(vehicleNumber);
		}
	};

	useEffect(() => {
		setVehicleNumber(vehicleData?.[0]?.Truck_Number);
	}, [vehicleData, setVehicleNumber]);

	return (
		<div className="space-y-5 border-t">
			{user?.team?.name !== TEAM_NAME?.WAREHOUSE && (
				<>
					<div className="mt-2 flex w-full flex-col items-start justify-start">
						<InputField
							id="vehicle"
							value={vehicleNumber || ""}
							onChange={(e) => setVehicleNumber(e.target.value)}
							disabled={!isVehicleEditing}
							label={tEmployee.vehicleNumber}
							placeholder={tEmployee.enterVehicleNumber}
							style={{ width: "100%" }}
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsVehicleEditing(!isVehicleEditing)}
							className="!bg-transparent font-inter text-xs font-normal text-brand-dark"
						>
							<Edit className="h-2 w-2" />
							{tEmployee.editVehicleNumber}
						</Button>
					</div>
					<div>
						<SelectField
							disabled={!isVehicleEditing}
							label={tEmployee.reasonForVehicleChange}
							placeholder={tEmployee.selectReasonForChange}
							options={vehicleChangeOptions.map((option) => ({ label: option, value: option }))}
							value={vehicleChangeNote}
							onValueChange={setVehicleChangeNote}
						/>
					</div>
				</>
			)}
			<Button
				disabled={isVehiclePending || (isVehicleEditing && !vehicleChangeNote)}
				variant={"filled"}
				onClick={handleStart}
				className="w-full"
			>
				{tEmployee.goToLogTime}
			</Button>
		</div>
	);
}
