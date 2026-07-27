import ForemanNoteTemplate from "@/module/material-management/material-requests/templates/foreman-note-template";

interface PageProps {
	params: Promise<{ pullListItemId: string }>;
	searchParams: Promise<{ note?: string }>;
}

export default async function ForemanNotePage({ params, searchParams }: PageProps) {
	const { pullListItemId } = await params;
	const { note = "" } = await searchParams;

	return <ForemanNoteTemplate pullListItemId={pullListItemId} initialNote={note} />;
}
