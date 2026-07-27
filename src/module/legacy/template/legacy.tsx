"use client";

import SectionHeader from "@/components/shared/section-header";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "legacy_portal_last_url";
const LOGIN_URL = "/api/legacy-portal/login.aspx";

export default function LegacyPortal() {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [src, setSrc] = useState(LOGIN_URL);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (saved) setSrc(saved);
	}, []);

	const handleLoad = () => {
		setLoading(false);
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const { pathname, search } = new URL(iframe.contentWindow!.location.href);
			if (!pathname.endsWith("login.aspx")) {
				sessionStorage.setItem(STORAGE_KEY, pathname + search);
			}
		} catch {
			// Ignore — access blocked if somehow cross-origin
		}
	};

	return (
		<main className="relative">
			<div className="absolute left-2 right-0 top-4 z-50">
				<SectionHeader title={""} hamburgerClassName="h-[10px] w-[50px] py-2 " hamburgerSize={15} />
			</div>
			{loading && (
				<div className="flex h-[calc(100vh-60px)] w-full items-center justify-center">
					<Spinner size="medium" />
				</div>
			)}
			<iframe
				ref={iframeRef}
				src={src}
				onLoad={handleLoad}
				className={`h-[calc(100vh-60px)] w-full border-0 ${loading ? "hidden" : ""}`}
			/>
		</main>
	);
}
