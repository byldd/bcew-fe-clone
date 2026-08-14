"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import SectionHeader from "@/components/shared/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DrivingSafetyViolationForm from "../components/driving-safety-violation-form";
import VehicleAccidentRecordForm from "../components/vehicle-accident-record-form";
import VehicleBreakdownRecordForm from "../components/vehicle-breakdown-record-form";
import { ADD_RECORD_TAB, ADD_RECORD_TAB_PARAM } from "../enums";

const TAB_TRIGGER_CLASS =
	"flex flex-col items-start gap-0.5 rounded-[10px] border px-4 py-2 text-left transition-colors data-[state=active]:border-brand-dark data-[state=inactive]:border-brand-dark10";

const AddNewRecordTemplate = () => {
	const searchParams = useSearchParams();
	const draftId = searchParams.get("draftId") ?? undefined;
	const tabParam = searchParams.get(ADD_RECORD_TAB_PARAM);
	const initialTab = Object.values(ADD_RECORD_TAB).includes(tabParam as ADD_RECORD_TAB)
		? (tabParam as ADD_RECORD_TAB)
		: ADD_RECORD_TAB.VEHICLE_ACCIDENT;
	const [tab, setTab] = useState<ADD_RECORD_TAB>(initialTab);

	return (
		<div className="space-y-4">
			<SectionHeader title="Add New Record" />

			<Tabs value={tab} onValueChange={(value) => setTab(value as ADD_RECORD_TAB)}>
				<div className="no-scrollbar overflow-x-auto pb-1">
					<TabsList className="inline-flex h-auto min-w-max items-center justify-start gap-2 rounded-md bg-transparent p-0">
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={ADD_RECORD_TAB.VEHICLE_ACCIDENT}>
							<span className="text-sm font-medium text-brand-dark">Vehicle Accident</span>
							<span className="text-xs text-brand-grey">Full accident report</span>
						</TabsTrigger>
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={ADD_RECORD_TAB.DRIVING_SAFETY_VIOLATION}>
							<span className="text-sm font-medium text-brand-dark">Driving Safety Violation</span>
							<span className="text-xs text-brand-grey">Office-received / manual</span>
						</TabsTrigger>
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={ADD_RECORD_TAB.VEHICLE_BREAKDOWN}>
							<span className="text-sm font-medium text-brand-dark">Vehicle Breakdown</span>
							<span className="text-xs text-brand-grey">Coordination notification</span>
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value={ADD_RECORD_TAB.VEHICLE_ACCIDENT}>
					<VehicleAccidentRecordForm draftId={draftId} />
				</TabsContent>

				<TabsContent value={ADD_RECORD_TAB.DRIVING_SAFETY_VIOLATION}>
					<DrivingSafetyViolationForm />
				</TabsContent>

				<TabsContent value={ADD_RECORD_TAB.VEHICLE_BREAKDOWN}>
					<VehicleBreakdownRecordForm />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default AddNewRecordTemplate;
