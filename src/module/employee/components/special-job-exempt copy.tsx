import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PiInfo } from "react-icons/pi";
import { cn } from "@/lib/utils/utils";

const SpecialJobExemptToggleLabel = ({ className }: { className?: string }) => {
	return (
		<div className={cn("flex items-center gap-1 text-sm text-brand-dark50", className)}>
			<label>Exempt Time Logging at Special Card</label>

			<Popover>
				<PopoverTrigger asChild>
					<PiInfo size={16} />
				</PopoverTrigger>
				<PopoverContent className="w-[450px] text-xs">
					<p className="mb-3 text-sm font-medium text-black">When toggled on the following will be applicable:</p>
					<ol className="space-y-2">
						<li>
							<span className="font-medium text-black">Job Visibility:</span> Only Field Jobs will be visible on the
							technician side
						</li>
						<li>
							<span className="font-medium text-black">Time Logging:</span> Only Field Job Time Logging is required.
							Full-day time logging is not required.
						</li>
						<li>
							<span className="font-medium text-black">Time Log Display:</span> Time Logs will show only Field Job
							Hours.
						</li>
						<li>
							<span className="font-medium text-black">Travel Pay:</span> Travel Pay will not be visible.
						</li>
						<li>
							<span className="font-medium text-black">ETR:</span> The ETR button will be hidden.
						</li>
						<li>
							<span className="font-medium text-black">Lateness:</span> Lateness will not be displayed for the user.
						</li>
						<li>
							<span className="font-medium text-black">Time Variance:</span> The user will not appear in the Time
							Variance table.
						</li>
						<li>
							<span className="font-medium text-black">Lockout:</span> If time log not completed for Field Job.
						</li>
					</ol>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default SpecialJobExemptToggleLabel;
