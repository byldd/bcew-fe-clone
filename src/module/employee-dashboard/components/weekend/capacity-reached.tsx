import { Button } from "@/components/ui/button";
import React from "react";
import { FiUsers } from "react-icons/fi";

const CapacityReached = ({ onClose }: { onClose: () => void }) => {
	return (
		<div className="space-y-4 rounded-[10px] p-2 text-center">
			<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-bgLightyellow">
				<FiUsers className="text-brand-lightred" />
			</div>
			<p className="text-xl font-semibold text-brand-dark">Capacity Reached</p>
			<p className="text-sm text-brand-dark60">
				The required number of technicians for this weekend&apos;s work has already been fulfilled. Thank you for your
				interest!
			</p>
			<Button variant={"filled"} onClick={onClose} className="w-full">
				Got it
			</Button>
		</div>
	);
};

export default CapacityReached;
