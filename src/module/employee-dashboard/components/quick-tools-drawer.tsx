"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { clearCookies } from "@/module/auth/utils/helpers";
import { cn } from "@/lib/utils/utils";
import useAuthStore from "@/store/auth-store";
import { RxCross2 } from "react-icons/rx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getNavItems } from "../utils/nav-items";

interface QuickToolsDrawerProps {
	open: boolean;
	onClose: () => void;
	isTimeLogPending?: boolean;
	setSelfScheduleOpen?: (open: boolean) => void;
}

const QuickToolsDrawer = ({ open, onClose, isTimeLogPending, setSelfScheduleOpen }: QuickToolsDrawerProps) => {
	const router = useRouter();
	const { user } = useAuthStore((state) => state);
	const [expandedItem, setExpandedItem] = useState<string | null>("");

	const navigate = (path: string) => {
		onClose();
		router.push(path);
	};

	const handleSignOut = () => {
		onClose();
		clearCookies();
		router.replace(routes.signIn);
	};

	const navItems = getNavItems({
		navigate,
		handleSignOut,
		isTimeLogPending,
		isWeekendSelfSchedulingAllowed: user?.isWeekendSelfSchedulingAllowed,
		isSelfSchedulingAllowed: user?.isSelfSchedulingAllowed,
		setSelfScheduleOpen: (open) => {
			onClose();
			setSelfScheduleOpen?.(open);
		},
	});

	return (
		<Sheet open={open} onOpenChange={(v) => !v && onClose()}>
			<SheetContent side="right" showDefaultClose={false} className="flex w-[80%] max-w-[320px] flex-col bg-white p-0">
				{/* Header */}
				<SheetHeader className="flex flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
					<SheetTitle className="text-base font-semibold text-brand-dark">Quick Tools</SheetTitle>
					<SheetClose asChild>
						<button onClick={onClose} className="pb-2 text-brand-dark hover:text-gray-600" aria-label="Close">
							<RxCross2 size={16} />
						</button>
					</SheetClose>
				</SheetHeader>

				{/* Nav items */}
				<nav className="flex-1 overflow-y-auto py-1">
					{navItems.map((item) => (
						<div key={item.label}>
							{item.topSeparator && <div className="mt-4" />}
							<button
								onClick={() => {
									if (item.children) {
										setExpandedItem(expandedItem === item.label ? null : item.label);
									} else {
										item.onClick();
									}
								}}
								disabled={item.disabled}
								className={cn(
									"flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100",
									item.disabled && "cursor-not-allowed opacity-40"
								)}
							>
								<span
									className={cn(
										"flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
										item.iconBg,
										item.iconColor
									)}
								>
									{item.icon}
								</span>
								<span className="flex-1 whitespace-pre-line text-sm font-medium text-brand-dark">{item.label}</span>
								{item.children &&
									(expandedItem === item.label ? (
										<ChevronUp size={16} className="text-gray-400" />
									) : (
										<ChevronDown size={16} className="text-gray-400" />
									))}
							</button>

							{/* Sub-items for collapsible sections */}
							{item.children && expandedItem === item.label && (
								<div>
									{item.children.map((child) => (
										<button
											key={child.label}
											onClick={child.onClick}
											disabled={child.disabled}
											className={cn(
												"flex w-full items-center px-5 py-3 pl-[68px] text-left text-sm text-brand-dark transition-colors hover:bg-gray-50 active:bg-gray-100",
												child.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent active:bg-transparent"
											)}
										>
											{child.label}
										</button>
									))}
								</div>
							)}
						</div>
					))}
				</nav>

				{/* Footer */}
				<div className="border-2 border-t py-4 text-center">
					<p className="text-xs font-medium text-[#6A7282]">Bucks County Electric Works</p>
					<p className="mt-0.5 text-xs text-[#99A1AF]">Version 2.4.1</p>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default QuickToolsDrawer;
