import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { DELIVERY_STATUS_STEP } from "../enums";

const DELIVERY_STATUS_ORDER = Object.values(DELIVERY_STATUS_STEP);

interface DeliveryStatusFlowProps {
	completedSteps: Set<DELIVERY_STATUS_STEP>;
	currentStep: DELIVERY_STATUS_STEP;
}

export default function DeliveryStatusFlow({ completedSteps, currentStep }: DeliveryStatusFlowProps) {
	return (
		<div className="w-full overflow-x-auto">
			<div className="flex min-w-[320px] items-start sm:min-w-0">
				{DELIVERY_STATUS_ORDER.map((step, index) => {
					const isDone = completedSteps.has(step);
					const isCurrent = step === currentStep;
					const isLast = index === DELIVERY_STATUS_ORDER.length - 1;

					return (
						<Fragment key={step}>
							<div className="flex flex-col items-center">
								<div
									className={cn(
										"flex h-4 w-4 shrink-0 items-center justify-center rounded-full sm:h-5 sm:w-5",
										isDone ? "bg-green-500" : isCurrent ? "bg-gray-900" : "bg-gray-200"
									)}
								>
									{isDone && <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />}
								</div>
								<span className="mt-1 w-10 text-center text-[9px] leading-tight text-gray-400 sm:w-12 sm:text-[11px]">
									{step}
								</span>
							</div>
							{/* One element per gap, sandwiched directly between the two dot columns instead of
							    two half-lines meeting at a shared edge — that seam was rendering as a visible
							    break in the connector on Android's subpixel flex-item rounding. */}
							{!isLast && (
								<div className={cn("mt-[7px] h-0.5 flex-1 sm:mt-[9px]", isDone ? "bg-gray-900" : "bg-gray-200")} />
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
