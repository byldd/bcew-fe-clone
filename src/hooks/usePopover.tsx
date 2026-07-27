import React, { useCallback, useState, useRef } from "react";
import { Popover as ShadcnPopover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/utils";

const popoverBodyVariants = {
	default: "max-w-[400px] max-h-[70vh] overflow-y-auto p-0",
};

interface IOpenPopover {
	popoverView: React.ReactNode;
	variant?: keyof typeof popoverBodyVariants;
	side?: "top" | "bottom" | "left" | "right";
	align?: "start" | "center" | "end";
}

interface IUsePopoverResult {
	openPopover: (options: IOpenPopover) => void;
	closePopover: () => void;
	Popover: React.FC;
	isOpen: boolean;
}

export const usePopover = (): IUsePopoverResult => {
	const [state, setState] = useState<{
		isOpen: boolean;
		view: React.ReactNode | null;
		variant: keyof typeof popoverBodyVariants;
		side?: "top" | "bottom" | "left" | "right";
		align?: "start" | "center" | "end";
	}>({
		isOpen: false,
		view: null,
		variant: "default",
		side: "bottom",
		align: "center",
	});

	const triggerRef = useRef<HTMLButtonElement | null>(null);

	const openPopover = useCallback(({ popoverView, variant, side, align }: IOpenPopover) => {
		setState({
			isOpen: true,
			view: popoverView,
			variant: variant || "default",
			side: side || "bottom",
			align: align || "center",
		});
	}, []);

	const closePopover = useCallback(() => {
		setState({
			isOpen: false,
			view: null,
			variant: "default",
		});
	}, []);

	const Popover: React.FC = () => {
		return (
			<ShadcnPopover open={state.isOpen} onOpenChange={(v) => !v && closePopover()}>
				<PopoverTrigger asChild>
					{/* Hidden trigger, click it programmatically if needed */}
					<span key="popover-trigger" ref={triggerRef} className="pointer-events-none absolute opacity-0" />
				</PopoverTrigger>
				<PopoverContent
					side={state.side}
					align={state.align}
					className={cn(popoverBodyVariants[state.variant], "w-full hover:bg-gray-100")}
				>
					{state.view}
				</PopoverContent>
			</ShadcnPopover>
		);
	};

	return { Popover, openPopover, closePopover, isOpen: state.isOpen };
};
