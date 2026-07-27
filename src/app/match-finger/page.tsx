"use client";

import FingerprintSdkLoader from "@/module/warehouse-fingerprint/components/fingerprint-sdk-loader";
import FingerprintMatch from "@/module/matching-finger/templates/fingerprint-match";

export default function MatchFingerPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-900">
			<FingerprintSdkLoader />
			<FingerprintMatch />
		</div>
	);
}
