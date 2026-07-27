import * as React from "react";

import { cn } from "@/lib/utils/utils";
import type { ReactElement } from "react";

interface InputProps extends React.ComponentProps<"input"> {
	/** Optional icon to display inside the input */
	icon?: ReactElement;
	/** Placement of the icon */
	iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type = "text", icon, iconPosition = "left", ...props }, ref) => {
		return (
			<div className={cn("relative flex items-center", className)}>
				{icon && iconPosition === "left" && (
					<span className="absolute left-3 top-1/2 z-10 -translate-y-1/2">{icon}</span>
				)}

				<input
					type={type}
					className={cn(
						"flex h-9 w-full rounded-[10px] border border-input bg-white px-3 py-2 text-left text-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						// Reserve space for icon so it doesn't overlap the placeholder/text
						icon && iconPosition === "left" && "pl-9",
						icon && iconPosition === "right" && "pr-9",
						className
					)}
					ref={ref}
					{...props}
				/>

				{icon && iconPosition === "right" && (
					<span className="absolute right-3 top-1/2 z-10 -translate-y-1/2">{icon}</span>
				)}
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };
