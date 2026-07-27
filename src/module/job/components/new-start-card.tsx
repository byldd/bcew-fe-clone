import { Button } from "@/components/ui/button";
import { FiEdit } from "react-icons/fi";
import { OptionYesNo } from "@/utils/enums";
import { INewStartCardProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { cn } from "@/lib/utils/utils";

export function NewStartCard({
	notReadyUpdate,
	handleEditButtonClick,
	isDisabled,
	bordered = true,
}: INewStartCardProps) {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<div className={cn("space-y-[10px]", bordered && "rounded-[10px] border border-brand-dark10 bg-white py-3 pl-4")}>
			<div className="flex items-center justify-between">
				<h3 className="text-base font-medium">{tschedule.newStart}</h3>
				<Button disabled={isDisabled} onClick={handleEditButtonClick}>
					<FiEdit className="h-[18px] w-[18px] text-brand-dark" />
				</Button>
			</div>
			<div className="space-y-3 text-sm">
				<div className="grid gap-1">
					<p className="text-xs font-medium text-brand-dark50">{tschedule.isTheSiteReady}</p>
					<p className="font-medium">{notReadyUpdate?.isReady ? OptionYesNo.YES : OptionYesNo.NO}</p>
				</div>
				<div className="grid gap-1">
					<p className="text-xs font-medium text-brand-dark50">{tschedule.isTheHomeClean}</p>
					<p className="font-medium">{notReadyUpdate?.isClean ? OptionYesNo.YES : OptionYesNo.NO}</p>
				</div>
				<div className="grid gap-1">
					<p className="text-xs font-medium text-brand-dark50">{tschedule.note}</p>
					<p className="font-medium">{notReadyUpdate?.note}</p>
				</div>
			</div>
		</div>
	);
}
