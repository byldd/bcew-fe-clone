import { Button } from "@/components/ui/button";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";

interface ReportIssueSuccessModalProps {
	onDone: () => void;
	referenceId: string;
}

export default function ReportIssueSuccessModal({ onDone, referenceId }: ReportIssueSuccessModalProps) {
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	return (
		<div className="space-y-3">
			<p className="text-sm font-medium text-brand-dark60">
				{tAdmin.issueSuccessfullyReported}
				<br /> {tAdmin.teamWillResolveQuickly}
			</p>

			<p className="text-xs font-medium text-brand-dark60">
				{tAdmin.referenceId}
				<br />
				<span className="text-sm font-medium text-brand-dark">#{referenceId}</span>
			</p>

			<Button className="mt-2 w-full" variant="filled" onClick={onDone}>
				{tAdmin.done}
			</Button>
		</div>
	);
}
