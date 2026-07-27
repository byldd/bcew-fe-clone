import { Check } from "lucide-react";

interface Props {
	currentFingerIndex: number;
	completedFingers: number[];
}

export default function FingerprintProgress({ currentFingerIndex, completedFingers }: Props) {
	const steps = ["FP1 Capture", "FP2 Capture", "Confirmation"];

	const getStepState = (step: number) => {
		if (step === 2 && completedFingers.length === 2) return "completed";
		if (completedFingers.includes(step)) return "completed";
		if (currentFingerIndex === step) return "active";
		return "pending";
	};

	return (
		<div className="mb-8 flex items-center">
			{steps.map((label, step) => {
				const state = getStepState(step);

				return (
					<div key={label} className="flex flex-1 items-center">
						<div className="flex items-center gap-2 whitespace-nowrap">
							<span
								className={`h-1.5 w-1.5 rounded-full ${
									state === "completed" ? "bg-[#0CC312]" : state === "active" ? "bg-brand-dark" : "bg-brand-dark30"
								}`}
							/>

							<span
								className={`text-xs font-medium ${
									state === "completed"
										? "text-[#0CC312]"
										: state === "active"
											? "text-brand-dark"
											: "text-brand-dark30"
								}`}
							>
								{state === "completed" && step !== 2 ? (
									<span className="inline-flex items-center gap-1">
										<Check className="h-3 w-3" />
										{label}
									</span>
								) : (
									label
								)}
							</span>
						</div>

						{/* connector line */}
						{step !== steps.length - 1 && (
							<div className="mx-3 h-[1px] flex-1 bg-[#E5E7EB]">
								<div
									className={`h-full transition-all duration-300 ${
										completedFingers.includes(step) ? "bg-[#0CC312]" : "bg-[#E5E7EB]"
									}`}
								/>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
