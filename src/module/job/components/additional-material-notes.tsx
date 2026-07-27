import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export type MaterialNoteEntry = {
	name: string;
	note: string;
	date: string;
};

export default function AdditionalMaterialNotes({ notes }: { notes: MaterialNoteEntry[] }) {
	return (
		<div className="divide-y divide-brand-dark10">
			{notes.map((entry, index) => (
				<div key={index} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
					<p className="text-sm text-brand-dark">{entry.note}</p>
					<div className="shrink-0 text-right">
						<p className="text-sm font-medium text-brand-dark">{entry.name}</p>
						<p className="text-xs text-brand-dark50">{toLocalFormattedDate(entry.date, DATE_FORMAT.DATE_AND_TIME)}</p>
					</div>
				</div>
			))}
		</div>
	);
}
