"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
	"inline-flex items-center 3xl:h-[70px] h-10 3xl:text-[30px] justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "transition",
				destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
				filled: "bg-brand-dark text-white hover:bg-gray-800",
				outline: "bg-transparent border border-black text-black hover:bg-gray-100",
				secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost: "bg-transparent text-black hover:bg-gray-100",
				primary: "bg-white text-black hover-white",
				link: "text-primary underline-offset-4 hover:underline",
				select:
					"bg-transparent text-black hover:bg-gray-100 text-left w-full flex-1 h-10 mt-0 rounded-md border-none font-normal outline-none focus:outline-none focus:ring-0 focus:border-none justify-between font-normal",
			},
			size: {
				default: "h-10 rounded-[10px] px-4 py-2 text-base font-medium",
				sm: "h-8 rounded-[10px] px-2 text-xs",
				lg: "h-10 rounded-[10px] px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, loading = false, loadingText, children, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={loading || props.disabled}
				{...props}
			>
				{loading && <Spinner className="text-white" />}
				{loading ? (loadingText ?? children) : children}
			</Comp>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
