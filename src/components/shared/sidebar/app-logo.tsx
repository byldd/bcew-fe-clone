"use client";
import * as React from "react";
import { SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

export function AppLogo() {
	const { open } = useSidebar();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<div className="">
					{open ? (
						<Link href="/">
							<Image src="/assets/svg/name-logo.svg" width={177} height={62} alt="" />
						</Link>
					) : (
						<Link href="/">
							<Image src="/assets/svg/logo.svg" width={63} height={62} alt="" />
						</Link>
					)}
				</div>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
