import { ReactNode } from "react";

import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";

const AccidentRecordSection = ({
	title,
	showAskTechnician = true,
	mandatory = false,
	isAsked = false,
	onToggleAsk,
	className,
	children,
}: {
	title: string;
	showAskTechnician?: boolean;
	mandatory?: boolean;
	isAsked?: boolean;
	onToggleAsk?: () => void;
	className?: string;
	children: ReactNode;
}) => {
	const label = mandatory ? "Ask Technician*" : isAsked ? "Remove Ask Technician" : "Ask Technician";
	const disabled = mandatory || isAsked;

	return (
		<section className={cn("space-y-4 border-t border-brand-dark10 py-4 first:border-t-0 first:pt-0", className)}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h4 className="min-w-0 text-sm font-medium text-brand-grey">{title}</h4>
				{showAskTechnician && (
					<Button
						type="button"
						disabled={mandatory}
						onClick={onToggleAsk}
						className={cn(
							"h-8 shrink-0 rounded-[8px] border px-3 py-1 text-xs font-medium transition-colors",
							isAsked || mandatory
								? "border-brand-dark bg-brand-dark text-white"
								: "border-brand-dark10 text-brand-dark",
							mandatory && "cursor-default"
						)}
					>
						{label}
					</Button>
				)}
			</div>
			<fieldset disabled={disabled} className={cn(disabled && "pointer-events-none opacity-60")}>
				{children}
			</fieldset>
		</section>
	);
};

export default AccidentRecordSection;
