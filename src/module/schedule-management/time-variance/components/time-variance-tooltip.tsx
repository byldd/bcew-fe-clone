"use client";

import { X } from "lucide-react";

const TimeVarianceTooltip = ({ onClose }: { onClose?: () => void }) => {
	return (
		<div className="w-[min(320px,calc(100vw-2rem))] rounded-[10px] border bg-[#F5F5F5] p-4 shadow-sm">
			<div className="flex items-start justify-between">
				<p className="text-base font-medium text-brand-dark">Time variance</p>
				{onClose && (
					<button onClick={onClose}>
						<X size={16} />
					</button>
				)}
			</div>

			<div className="mt-3 space-y-3 text-xs">
				<ul className="list-disc space-y-2 pl-4 font-normal text-brand-grey">
					<li>
						<span className="text-sm font-medium text-brand-dark">Roster:</span> Extended time (if available), else
						regular roster
					</li>

					<li>
						<span className="text-sm font-medium text-brand-dark">Actual:</span> Override time (if available), else
						technician logs
						<ul className="mt-1 list-disc pl-5">
							<li>Start = First stop start</li>
							<li>End = Last stop end</li>
						</ul>
					</li>

					<li>
						<span className="text-sm font-medium text-brand-dark">Pause:</span> Includes gaps between stops, lunch, and
						manual pauses
					</li>
				</ul>

				<div className="border-t" />

				<div className="text-xs font-normal text-brand-grey">
					<p className="text-sm font-medium text-brand-dark">Hours:</p>
					<p>
						<span className="text-sm font-medium text-brand-dark">Actual</span> = End - Start - Pause
					</p>
					<p>
						<span className="text-sm font-medium text-brand-dark">Roster</span> = End - Start
					</p>
				</div>
			</div>
		</div>
	);
};

export default TimeVarianceTooltip;
