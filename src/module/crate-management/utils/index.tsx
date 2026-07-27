import { Html5Qrcode } from "html5-qrcode";

const FILE_SCAN_TIMEOUT_MS = 8000;

export function scanFileWithTimeout(scanner: Html5Qrcode, file: File): Promise<string> {
	return Promise.race([
		scanner.scanFile(file, false),
		new Promise<string>((_, reject) => {
			setTimeout(() => reject(new Error("QR scan timed out")), FILE_SCAN_TIMEOUT_MS);
		}),
	]);
}

export function ScanLine() {
	return (
		<div className="pointer-events-none absolute inset-x-6 inset-y-4">
			<div className="absolute inset-x-0 h-0.5 animate-scan-line rounded-full bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.7)]" />
		</div>
	);
}
