"use client";

import Script from "next/script";

export default function FingerprintSdkLoader() {
	return (
		<>
			<Script id="websdk" src="/sdk/websdk.client.min.js" strategy="afterInteractive" />

			<Script id="fingerprint-sdk" src="/sdk/fingerprint.sdk.min.js" strategy="afterInteractive" />
		</>
	);
}
