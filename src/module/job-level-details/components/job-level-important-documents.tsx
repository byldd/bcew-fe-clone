import { Check, ChevronDown, FileText } from "lucide-react";
import { ImportantDocument } from "../utils/types";

// TODO: Replace with real documents + open/annotate behavior once the PDF backend is ready.
const IMPORTANT_DOCUMENTS_PLACEHOLDER: ImportantDocument[] = [
	{ id: "option-selection", title: "Dummy - Option Selection Sheet", meta: "TH B05 U01 · Updated Oct 10" },
	{ id: "floor-plan-1", title: "Dummy - Floor Plan — Level 1", meta: "PDF · 2.4 MB · Annotatable" },
	{ id: "floor-plan-2", title: "Dummy - Floor Plan — Level 2", meta: "PDF · 2.1 MB · Annotatable" },
	{ id: "panel-schedule", title: "Dummy - Panel Schedule", meta: "PDF · 0.8 MB · Rev 3" },
];

export default function JobLevelImportantDocuments() {
	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold text-brand-dark">Important Documents</h3>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{IMPORTANT_DOCUMENTS_PLACEHOLDER.map((document) => (
					<button
						key={document.id}
						type="button"
						className="flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50/40 p-3 text-left transition-colors hover:bg-red-50"
					>
						<span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-red-100 text-red-500">
							<FileText className="h-4 w-4" />
						</span>
						<div className="min-w-0 flex-1 space-y-1">
							<p className="truncate text-sm font-semibold text-brand-dark">{document.title}</p>
							<p className="flex items-center gap-1 truncate text-xs text-brand-dark50">
								{document.meta} · Offline
								<Check className="h-3 w-3 text-green-600" />
								<ChevronDown className="h-3 w-3" />
							</p>
						</div>
					</button>
				))}
			</div>

			<p className="text-xs text-brand-dark50">
				All documents downloaded for offline access. Tap to open · Annotation supported.
			</p>
		</div>
	);
}
