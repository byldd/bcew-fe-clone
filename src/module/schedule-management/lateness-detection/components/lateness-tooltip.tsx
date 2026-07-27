"use client";

import { X } from "lucide-react";

const LatenessTooltip = ({ onClose }: { onClose?: () => void }) => {
	return (
		<div className="w-[min(360px,calc(100vw-2rem))] rounded-[10px] border bg-[#F5F5F5] p-4 shadow-sm">
			<div className="flex items-start justify-between">
				<p className="text-base font-medium text-brand-dark">Late Start & Early Quit Detection</p>

				{onClose && (
					<button onClick={onClose}>
						<X size={16} />
					</button>
				)}
			</div>

			<div className="mt-3 space-y-3 text-xs text-brand-dark">
				<div>
					<p className="mb-1 font-medium">How it works:</p>

					<p>Compares an employee&apos;s actual logged time against their scheduled roster time.</p>

					<p className="mt-2">
						Admin view: shows every employee who logs in late or quits early, regardless of how small the difference is
						(even 1–2 minutes), helping identify attendance patterns.
					</p>

					<p className="mt-2">
						Mobile app: the lateness or early quit banner only appears when the difference exceeds{" "}
						<strong>7.5 minutes</strong>, which is the official threshold for being considered late.
					</p>

					<p className="mt-2">
						Employees are prompted to confirm or explain their attendance only when the 7.5-minute threshold is crossed.
					</p>
				</div>

				<div>
					<p className="mb-1 font-medium">Who&apos;s excluded:</p>

					<p>Self-scheduling employees.</p>

					<p className="mt-1">Employees with a time-logging-exempt role.</p>
				</div>
			</div>
		</div>
	);
};

export default LatenessTooltip;
