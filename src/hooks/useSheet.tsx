import { Sheet, SheetContent, SheetTitle, SheetHeader, SheetDescription } from "@/components/ui/sheet";
import React, { useState, useCallback } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

type SheetSide = "top" | "bottom" | "left" | "right" | "rightWide";

interface IOpenSheet {
	sheetTitle?: React.ReactNode;
	sheetView: React.ReactNode;
	side?: SheetSide;
	subHeader?: React.ReactNode;
	footer?: React.ReactNode;
	showDefaultClose?: boolean;
	showDefaultHeader?: boolean;
}

interface IUseSheetResult {
	openSheet: (options: IOpenSheet) => void;
	closeSheet: () => void;
	Sheet: React.FC;
}

export const useSheet = (): IUseSheetResult => {
	const [state, setState] = useState<{
		isOpen: boolean;
		title: React.ReactNode | undefined | null;
		view: React.ReactNode | null;
		side: SheetSide;
		subHeader?: React.ReactNode;
		footer?: React.ReactNode;
		showDefaultClose?: boolean;
		showDefaultHeader?: boolean;
	}>({
		isOpen: false,
		title: undefined as string | undefined | null,
		view: null as React.ReactNode | null,
		side: "right",
		subHeader: undefined as string | undefined | null,
		footer: undefined as string | undefined | null,
		showDefaultClose: true,
		showDefaultHeader: true,
	});

	const openSheet = useCallback(
		({
			sheetTitle,
			sheetView,
			side = "right",
			subHeader,
			footer,
			showDefaultClose = true,
			showDefaultHeader = true,
		}: IOpenSheet) => {
			setState({
				isOpen: true,
				title: sheetTitle,
				view: sheetView,
				side,
				subHeader,
				footer,
				showDefaultClose,
				showDefaultHeader,
			});
		},
		[]
	);

	const closeSheet = useCallback(() => {
		setState({
			isOpen: false,
			title: null,
			view: null,
			side: "right",
			subHeader: undefined,
			footer: undefined,
			showDefaultClose: true,
		});
	}, []);

	const SheetComponent: React.FC = () => {
		return (
			<Sheet open={state.isOpen}>
				<SheetContent
					side={state.side}
					className="w-full overflow-y-auto sm:w-[500px] sm:max-w-[700px]"
					showDefaultClose={state.showDefaultClose}
					onClose={closeSheet}
				>
					{state.showDefaultHeader && (
						<SheetHeader>
							<SheetTitle>{state.title}</SheetTitle>
							<SheetDescription>{state.subHeader}</SheetDescription>
						</SheetHeader>
					)}

					<ScrollArea>{state.view}</ScrollArea>
				</SheetContent>
			</Sheet>
		);
	};

	return { Sheet: SheetComponent, closeSheet, openSheet };
};
