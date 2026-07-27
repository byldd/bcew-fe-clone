import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/utils/utils";
import React from "react";
import TroubleshootingStpesModal from "./troubleshooting-steps-modal";
import { IEmployeeGPSWorking } from "@/module/job/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export default function GpsNotWorkingBanner({ gpsWorkingData }: { gpsWorkingData: IEmployeeGPSWorking | undefined }) {
	const { licenseNumber, isMarkedOfflineByEmployee, isGPSWorking } = gpsWorkingData || {};
	const { openModal, closeModal, Modal } = useModal();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const handleBannerClick = () => {
		openModal({
			variant: "medium",
			modalTitle: tEmployee.gpsTroubleshootingSteps,
			subHeader: tEmployee.turnOffVehicleStep1,
			modalView: <TroubleshootingStpesModal onClose={closeModal} licenseNumber={licenseNumber} />,
		});
	};

	return (
		<div className="rounded-[10px] bg-brand-bgLightgrey04 text-start text-sm text-brand-dark">
			{isMarkedOfflineByEmployee ? (
				<p
					className={cn(
						"w-full rounded bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800"
					)}
				>
					{tEmployee.manualTimeLogInfo}
				</p>
			) : isGPSWorking ? (
				<p
					className={cn(
						"w-full rounded bg-brand-green800/10 py-2 text-center font-inter text-xs font-medium text-brand-green800"
					)}
				>
					{tEmployee.gpsIssueResolved} {licenseNumber} {tEmployee.vehicleBackOnline}
				</p>
			) : (
				<p
					className={cn(
						"w-full rounded bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800"
					)}
				>
					{tEmployee.truck}
					<span className="font-bold">{licenseNumber}:</span> {tEmployee.gpsNotWorking}{" "}
					<span onClick={handleBannerClick} className="cursor-pointer underline">
						{tEmployee.clickHere}
					</span>{" "}
					{tEmployee.toFix}.
				</p>
			)}
			<Modal />
		</div>
	);
}
