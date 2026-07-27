import { FaRegFilePdf } from "react-icons/fa6";

const DocumentPdfLink = ({ fileName, href }: { fileName: string; href: string }) => (
	<div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-brand-bgLightgrey p-3">
		<div className="flex min-w-0 items-center gap-2">
			<FaRegFilePdf className="size-4 shrink-0 text-brand-red" />
			<p className="truncate text-xs font-medium text-brand-dark">{fileName}</p>
		</div>
		<a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-medium text-blue-600">
			Download
		</a>
	</div>
);

export default DocumentPdfLink;
