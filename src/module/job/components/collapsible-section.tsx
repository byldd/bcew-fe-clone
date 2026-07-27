"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { cn } from "@/lib/utils/utils";
import { ICollapsibleSectionProps } from "../types";

export function CollapsibleSection({
	title,
	action,
	defaultOpen = true,
	className,
	contentClassName,
	children,
}: ICollapsibleSectionProps) {
	return (
		<Accordion
			type="single"
			collapsible
			defaultValue={defaultOpen ? "section" : undefined}
			className={cn("w-full", className)}
		>
			<AccordionItem value="section">
				<AccordionPrimitive.Header className="flex items-center gap-2">
					<div className="min-w-0 flex-1 text-base font-medium text-brand-dark">{title}</div>
					{action ? <div className="flex shrink-0 items-center">{action}</div> : null}
					<AccordionPrimitive.Trigger
						aria-label="Toggle section"
						className="flex shrink-0 items-center [&[data-state=open]>svg]:rotate-180"
					>
						<ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
					</AccordionPrimitive.Trigger>
				</AccordionPrimitive.Header>
				<AccordionContent className={cn("pt-3", contentClassName)}>{children}</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
