import { Button } from "@/components/ui/button";
import { useEmployeeGPSOffline, useEmployeeGPSOnline } from "../../hooks/useGPSWorking";
import { openErrorToast } from "@/components/toast";
import { useModal } from "@/hooks/useModal";
import { useQueryClient } from "@tanstack/react-query";
import { SuccessStatusModal } from "./success-status-modal";
import { useState } from "react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const TroubleshootingStpesModal = ({
	onClose,
	licenseNumber,
}: {
	onClose: () => void;
	licenseNumber: string | undefined;
}) => {
	const { mutate: markGPSOnline } = useEmployeeGPSOnline();
	const { mutate: markGPSOffline } = useEmployeeGPSOffline();
	const { Modal, openModal } = useModal();
	const [showVideo, setShowVideo] = useState(false);
	const queryClient = useQueryClient();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const closeModal = () => {
		queryClient.invalidateQueries({ queryKey: ["employee-gps-working"] });
		onClose();
	};

	const handleMutation = (mutation: typeof markGPSOnline, isOnline?: boolean) => {
		mutation(undefined, {
			onSuccess: () => {
				openModal({
					modalTitle: "",
					modalView: (
						<SuccessStatusModal
							message={
								isOnline
									? `GPS Issue Resolved. Truck ${licenseNumber} is back online. Data will reflect within 30 minutes.`
									: tEmployee.manualTimeLogInfo
							}
							onClose={closeModal}
						/>
					),
				});
			},
			onError: (error) => openErrorToast({ error }),
		});
	};

	const handleGPSOnline = () => handleMutation(markGPSOnline, true);
	const handleGPSOffline = () => handleMutation(markGPSOffline);

	const handleWatchTutorialClick = () => {
		setShowVideo(true);
	};

	return (
		<div className="flex w-full flex-col gap-2 rounded-[20px] bg-white">
			<p className="font-inter text-sm font-normal">{tEmployee.gpsWorkingRefreshApp}</p>

			<div className="space-y-4 text-sm">
				<div className="space-y-2">
					<h2 className="font-semibold text-brand-dark">{tEmployee.step1LocateDevice}</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li className="font-inter text-xs font-medium">{tEmployee.removePanelUnderSteering}</li>
						<li className="font-inter text-xs font-medium">{tEmployee.findGeotabGpsDevice}</li>
					</ul>
				</div>

				<div className="space-y-2">
					<h2 className="font-semibold text-brand-dark">{tEmployee.step2RestartDevice}</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li className="font-inter text-xs font-medium">{tEmployee.unplugWait2Minutes}</li>
					</ul>
				</div>

				<div className="space-y-2">
					<h2 className="font-semibold text-brand-dark">{tEmployee.step3ReconnectPower}</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li className="font-inter text-xs font-medium">{tEmployee.reconnectStartVehicle}</li>
					</ul>
				</div>

				<div className="space-y-2">
					<h2 className="font-semibold text-brand-dark">{tEmployee.step4CheckLights}</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li className="font-inter text-xs font-medium">{tEmployee.waitForThreeGreenLights}</li>
					</ul>
				</div>
			</div>

			<div className="pt-2 text-xs font-semibold text-brand-dark60">
				{tEmployee.havingTrouble}{" "}
				{!showVideo ? (
					<span className="font-semibold text-brand-dark underline" onClick={handleWatchTutorialClick}>
						{tEmployee.watchTutorial}
					</span>
				) : (
					<span className="font-semibold text-brand-dark underline" onClick={() => setShowVideo(false)}>
						{tEmployee.closeTutorial}
					</span>
				)}
				{showVideo && (
					<div className="modal">
						<video width="100%" controls autoPlay>
							<source
								src="https://bcew-staging.s3.us-east-1.amazonaws.com/Restart_Geotab_Device.mp4"
								type="video/mp4"
							/>
						</video>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-3 pt-4">
				<Button variant="outline" className="w-full" onClick={handleGPSOffline}>
					{tEmployee.gpsStillOffline}
				</Button>

				<Button variant="filled" className="w-full" onClick={handleGPSOnline}>
					{tEmployee.gpsIsWorking}
				</Button>
			</div>
			<Modal />
		</div>
	);
};

export default TroubleshootingStpesModal;
