"use client";

import { ExternalLink } from "lucide-react";

interface PdfModalProps {
	fileUrl: string;
	fileName: string;
}

const PdfModal = ({ fileUrl, fileName }: PdfModalProps) => (
	<div className="flex h-full w-full flex-col gap-2">
		<a
			href={fileUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center gap-1 self-end text-xs text-brand-grey hover:underline"
		>
			Open in new tab <ExternalLink className="h-3 w-3" />
		</a>
		<iframe src={fileUrl} title={fileName} className="h-full w-full rounded-[8px] border-none bg-brand-bgLightgrey" />
	</div>
);

export default PdfModal;
