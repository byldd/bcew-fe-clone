"use client";
import SectionHeader from "@/components/shared/section-header";
import { cn } from "@/lib/utils/utils";
import { ChevronRight } from "lucide-react";
import React from "react";
import { CONFIG_GROUPS } from "../utils/config-list";
import { useRouter } from "next/navigation";

const AdminSettingConfig = () => {
	const router = useRouter();

	const handleNavigation = (path: string) => {
		router.push(path);
	};
	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<div className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<SectionHeader title={"Configuration"} />
				</div>
			</div>
			<div className="mt-6 flex flex-col gap-6 overflow-y-auto">
				{CONFIG_GROUPS.map((group) => (
					<div key={group.groupLabel} className="flex flex-col gap-3">
						<p className="text-sm text-[#15151580]">{group.groupLabel}</p>
						<div className="flex flex-col gap-2">
							{group.items.map((item) => (
								<div
									key={item.title}
									onClick={() => handleNavigation(item.url)}
									className={cn(
										"flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#1515151A] bg-white px-5 py-4 text-left",
										"transition-colors hover:bg-gray-50"
									)}
								>
									<div className="flex flex-col gap-1">
										<span className="text-sm font-bold text-brand-dark">{item.title}</span>
										<span className="text-xs text-[#15151580]">{item.description}</span>
									</div>
									<ChevronRight size={18} className="shrink-0 text-[#15151580]" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AdminSettingConfig;
