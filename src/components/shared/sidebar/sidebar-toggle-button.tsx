"use client";

import { AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface SidebarToggleButtonProps {
	onClick: () => void;
	icon?: React.ReactNode;
	className?: string;
}

export default function SidebarToggleButton({
	onClick,
	icon = <AlignJustify />, // default icon
	className,
}: SidebarToggleButtonProps) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-[#1515151A] bg-white",
				className
			)}
		>
			{icon}
		</button>
	);
}
