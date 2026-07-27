"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils/utils";
import { ModalPortalContext } from "./modal-portal-context";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex h-10 w-full items-center justify-between whitespace-nowrap rounded-[8px] border-none bg-[#F5F5F5] px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1",
			className
		)}
		{...props}
	>
		{children}
		<SelectPrimitive.Icon asChild>
			<ChevronDown className="h-4 w-4 opacity-50" />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.ScrollUpButton
		ref={ref}
		className={cn("flex cursor-default items-center justify-center py-1", className)}
		{...props}
	>
		<ChevronUp className="h-4 w-4" />
	</SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.ScrollDownButton
		ref={ref}
		className={cn("flex cursor-default items-center justify-center py-1", className)}
		{...props}
	>
		<ChevronDown className="h-4 w-4" />
	</SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
	const portalContainerRef = React.useContext(ModalPortalContext);

	return (
		<SelectPrimitive.Portal container={portalContainerRef?.current ?? undefined}>
			<SelectPrimitive.Content
				ref={ref}
				className={cn(
					"relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] origin-[--radix-select-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					position === "popper" &&
						"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					className
				)}
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						"p-1",
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className
		)}
		{...props}
	>
		<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			<SelectPrimitive.ItemIndicator>
				<Check className="h-4 w-4" />
			</SelectPrimitive.ItemIndicator>
		</span>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
	SelectScrollUpButton,
	SelectScrollDownButton,
};

interface PhoneCountryOption {
	value?: string;
	label: string;
	divider?: boolean;
}

export interface PhoneCountrySelectProps {
	value?: string;
	onChange: (value?: string) => void;
	options: PhoneCountryOption[];
	iconComponent?: React.ComponentType<{ country: string; label: string }>;
	disabled?: boolean;
	readOnly?: boolean;
	className?: string;
}

export function PhoneCountrySelect({
	value,
	onChange,
	options,
	iconComponent: FlagIcon,
	disabled,
}: PhoneCountrySelectProps) {
	const countryOptions = options.filter((opt) => opt.value && !opt.divider);

	return (
		<Select value={value ?? "US"} onValueChange={(v) => onChange(v || undefined)} disabled={disabled}>
			<SelectTrigger className="h-auto w-auto border-none bg-transparent px-0.5 py-0 shadow-none focus:outline-none focus:ring-0 [&>svg]:hidden">
				<div className="flex items-center gap-0.5">
					{value && FlagIcon ? (
						<span className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm [&_.PhoneInputCountryIcon]:h-full [&_.PhoneInputCountryIcon]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
							<FlagIcon country={value} label={value} />
						</span>
					) : (
						<span className="text-base">🌐</span>
					)}
					<span className="text-[10px] leading-none opacity-50">▾</span>
				</div>
			</SelectTrigger>
			<SelectContent className="z-[9999] max-h-[260px] min-w-[240px]">
				{countryOptions.map((option) => (
					<SelectItem key={option.value} value={option.value!}>
						<span className="flex items-center gap-2">
							{FlagIcon && (
								<span className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm [&_.PhoneInputCountryIcon]:h-full [&_.PhoneInputCountryIcon]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
									<FlagIcon country={option.value!} label={option.label} />
								</span>
							)}
							<span className="text-sm">{option.label}</span>
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
