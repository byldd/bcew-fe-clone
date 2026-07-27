import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogDescription,
	DialogFooter,
	DialogPortal,
	DialogOverlay,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/utils";
import React, { useState, useCallback, useRef } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { IOpenModal, IUseModalResult } from "@/types";
import { modalBodyVariants } from "@/utils/constants";
import { ModalPortalContext } from "@/components/ui/modal-portal-context";

export const useModal = (onDefaultClose?: () => void): IUseModalResult => {
	const [state, setState] = useState<{
		isOpen: boolean;
		title: React.ReactNode | undefined | null;
		view: React.ReactNode | null;
		subHeader?: React.ReactNode;
		footer?: React.ReactNode;
		variant: keyof typeof modalBodyVariants;
		showDefaultClose?: boolean;
		closeOnOutsideClick?: boolean;
	}>({
		isOpen: false,
		title: undefined as string | undefined | null,
		view: null as React.ReactNode | null,
		subHeader: undefined as string | undefined | null,
		footer: undefined as string | undefined | null,
		variant: "medium",
		showDefaultClose: true,
		closeOnOutsideClick: false,
	});

	const openModal = useCallback(
		({
			modalTitle,
			modalView,
			subHeader,
			footer,
			variant = "default",
			showDefaultClose = true,
			closeOnOutsideClick = false,
		}: IOpenModal) => {
			setState({
				isOpen: true,
				title: modalTitle,
				view: modalView,
				variant: variant,
				subHeader,
				footer,
				showDefaultClose,
				closeOnOutsideClick,
			});
		},
		[]
	);

	const closeModal = useCallback(() => {
		onDefaultClose?.(); // callback when modal close by default close button
		setState({
			isOpen: false,
			title: null,
			view: null,
			subHeader: undefined,
			footer: undefined,
			variant: "default",
			showDefaultClose: true,
		});
	}, [onDefaultClose]);

	// A plain ref, not state: setting state here would cause a re-render, and since `Modal` below is
	// redefined fresh on every render of the calling component, that re-render swaps `Modal`'s
	// identity, remounting DialogContent and re-firing this ref - an infinite loop.
	const portalContainerRef = useRef<HTMLDivElement | null>(null);

	const Modal: React.FC = () => {
		return (
			<Dialog open={state.isOpen} onOpenChange={closeModal}>
				<DialogPortal>
					<DialogOverlay className="fixed inset-0 z-50 bg-white/30 backdrop-blur-md" />
					<DialogContent
						ref={(node) => {
							portalContainerRef.current = node;
						}}
						onInteractOutside={(e) => {
							if (!state.closeOnOutsideClick) {
								e.preventDefault();
							}
						}}
						aria-hidden="false"
						showDefaultClose={state.showDefaultClose}
						className={cn(
							"fixed z-50 flex flex-col rounded-[20px] bg-white p-5 shadow-lg sm:rounded-[20px]",
							modalBodyVariants[state.variant]
						)}
						style={{ overflow: "visible" }}
					>
						<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
							<DialogHeader className="flex items-start justify-between">
								{state.title ? (
									<DialogTitle className="font-inter text-xl font-normal text-brand-dark">{state.title}</DialogTitle>
								) : (
									<VisuallyHidden>
										<DialogTitle>Modal</DialogTitle>
									</VisuallyHidden>
								)}
								{state.subHeader && (
									<DialogDescription className="mt-[8px] text-left font-inter text-sm font-medium text-brand-dark60">
										{state.subHeader}
									</DialogDescription>
								)}
							</DialogHeader>
							<ModalPortalContext.Provider value={portalContainerRef}>
								<div className="max-h-[60vh] flex-1 overflow-x-auto sm:max-h-[65vh]">{state.view}</div>
							</ModalPortalContext.Provider>
							{state.footer && <DialogFooter>{state.footer}</DialogFooter>}
							{state.showDefaultClose && (
								<DialogClose
									onClick={(e) => {
										e.stopPropagation();
										closeModal();
									}}
									className="absolute right-4 top-4 z-50 text-black"
								/>
							)}
						</div>
					</DialogContent>
				</DialogPortal>
			</Dialog>
		);
	};

	return { Modal, closeModal, openModal };
};
