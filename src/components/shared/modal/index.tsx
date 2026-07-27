"use client";

import { useCallback, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/store/use-modal-store";
import { cn } from "@/lib/utils/utils";

interface ModalProps {
	modalId: string;
	children: React.ReactNode;
	className?: string;
	titleClassName?: string;
	width?: string;
	title?: string;
	description?: string;
	onClose?: () => void;
}

export function Modal({
	modalId,
	children,
	className,
	titleClassName,
	width = "max-w-3xl",
	title,
	description,
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

	useEffect(() => {
		return () => {
			onClose?.();
			closeModal(modalId);
		};
	}, [closeModal, modalId, onClose]);

	const isModalOpen = isOpen(modalId);

	return (
		<Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
			<DialogContent
				aria-hidden="false"
				ref={dialogRef}
				className={cn("scroll max-h-[90vh] w-[96%] gap-2 overflow-y-auto rounded-md", className, width)}
			>
				<DialogHeader>
					{title && (
						<DialogTitle className={cn("text-2xl font-bold text-grey-700", titleClassName)}>{title}</DialogTitle>
					)}
				</DialogHeader>
				{/* this is here only for passing next.js warning error related to missing DialogDescription */}
				<DialogDescription className="hidden">{description}</DialogDescription>
				<div>{children}</div>
			</DialogContent>
		</Dialog>
	);
}
