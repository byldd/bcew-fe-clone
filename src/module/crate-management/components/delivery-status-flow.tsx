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
			<div className="flex min-w-[320px] items-center sm:min-w-0">
				{DELIVERY_STATUS_ORDER.map((step, index) => {
					const isDone = completedSteps.has(step);
					const isCurrent = step === currentStep;
					return (
						<div key={step} className="flex flex-1 flex-col items-center">
							<div className="flex w-full items-center">
								{index > 0 && (
									<div className={cn("h-px flex-1", isDone || isCurrent ? "bg-gray-900" : "bg-gray-200")} />
								)}
								<div
									className={cn(
										"flex h-4 w-4 shrink-0 items-center justify-center rounded-full sm:h-5 sm:w-5",
										isDone ? "bg-green-500" : isCurrent ? "bg-gray-900" : "bg-gray-200"
									)}
								>
									{isDone && <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />}
								</div>
								{index < DELIVERY_STATUS_ORDER.length - 1 && (
									<div className={cn("h-px flex-1", isDone ? "bg-gray-900" : "bg-gray-200")} />
								)}
							</div>
							<span className="mt-1 text-center text-[9px] leading-tight text-gray-400 sm:text-[11px]">{step}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
