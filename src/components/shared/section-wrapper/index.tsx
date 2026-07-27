import { cn } from "@/lib/utils/utils";
import React, { JSX } from "react";

interface SectionWrapperProps {
	children: React.ReactNode;
	className?: string;
	as?: keyof JSX.IntrinsicElements;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, className, as: Tag = "div" }) => {
	return (
		<Tag className={cn("section-wrapper flex-1 overflow-y-auto bg-brand-bgLightgrey50 px-4 py-6", className)}>
			{children}
		</Tag>
	);
};

export default SectionWrapper;
