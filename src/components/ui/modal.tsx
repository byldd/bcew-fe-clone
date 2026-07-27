import { useCallback, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogPortal,
	DialogOverlay,
	DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/utils";
import { useModalStore } from "@/store/use-modal-store";

interface ModalProps {
	modalId: string;
	children: React.ReactNode;
	className?: string;
	titleClassName?: string;
	width?: string;
	title?: React.ReactNode;
	subHeader?: React.ReactNode;
	footer?: React.ReactNode;
	onClose?: () => void;
}

export function Modal({
	modalId,
	children,
	className,
	titleClassName,
	width = "max-w-3xl",
	title,
	subHeader,
	footer,
	onClose,
}: ModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const { isOpen, closeModal } = useModalStore();
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				onClose?.();
				closeModal(modalId);
			}
		},
		[closeModal, modalId, onClose]
	);
	const isModalOpen = isOpen(modalId);

	return (
		<Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
			<DialogPortal>
				<DialogOverlay className="fixed inset-0 z-50 bg-white/30 backdrop-blur-md" />
				<DialogContent
					aria-hidden="false"
					ref={dialogRef}
					className={cn(
						// Mobile-first: full width, bottom sheet style
						// Use inset-0 + m-auto (transform-free centering) so native <select> dropdowns
						// (e.g. react-phone-number-input) don't mis-position due to CSS transforms in Chrome.
						"fixed z-50 flex flex-col rounded-[20px] bg-white p-5 shadow-lg sm:rounded-[20px]",
						"left-1/2 top-1/2 w-[90%] max-w-md -translate-y-1/2 translate-x-1/2 transform",
						"!mx-0 sm:max-w-md",
						className,
						width
					)}
					style={{ overflow: "hidden" }}
				>
					{/* Fixed Header */}

					<DialogHeader className="flex items-start justify-between">
						{title && <DialogTitle className={cn("text-xl font-normal", titleClassName)}>{title}</DialogTitle>}
						{subHeader && (
							<DialogDescription className="!mt-0 text-left text-sm font-medium text-brand-dark60">
								{subHeader}
							</DialogDescription>
						)}
					</DialogHeader>

					{/* Scrollable Content */}
					<div className="max-h-[60vh] flex-1 overflow-y-auto sm:max-h-[65vh]">{children}</div>
					{/* Fixed Footer (if any) */}
					{footer && <DialogFooter>{footer}</DialogFooter>}
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
}
