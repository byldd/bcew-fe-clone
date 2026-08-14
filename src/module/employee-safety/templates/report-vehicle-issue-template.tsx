"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useModal } from "@/hooks/useModal";

import VehicleIssueChoiceList from "../components/vehicle-issue-choice-list";

const ReportVehicleIssueTemplate = () => {
	const router = useRouter();
	const { Modal, openModal } = useModal();

	const showChoices = () => {
		openModal({
			modalTitle: "What would you like to report?",
			subHeader: "Choose the type of report for this vehicle.",
			modalView: (
				<VehicleIssueChoiceList
					onSelect={(path) => {
						router.push(path);
					}}
				/>
			),
			variant: "medium",
		});
	};

	useEffect(() => {
		showChoices();
		// open once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-brand-bgLightgrey p-4 text-center">
			<h3 className="text-xl font-medium text-brand-dark">Report a Vehicle Issue</h3>
			<p className="max-w-sm text-sm text-brand-dark60">
				Select whether this is a vehicle accident or a vehicle breakdown to continue.
			</p>
			<div className="flex flex-col items-center gap-2">
				<Button type="button" variant="filled" onClick={showChoices}>
					Choose Report Type
				</Button>
				<Button type="button" variant="outline" onClick={() => router.push(routes.employee.dashboard)}>
					Back to Dashboard
				</Button>
			</div>

			<Modal />
		</div>
	);
};

export default ReportVehicleIssueTemplate;
