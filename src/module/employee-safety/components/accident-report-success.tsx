import { Button } from "@/components/ui/button";
import { FaCircleCheck } from "react-icons/fa6";

type AccidentReportSuccessProps = {
	onGoHome: () => void;
	onCheckStatus: () => void;
};

const AccidentReportSuccess = ({ onGoHome, onCheckStatus }: AccidentReportSuccessProps) => (
	<div className="flex min-h-screen w-full flex-col bg-brand-bgLightgrey">
		<div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
			<div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#34C7591A]">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]">
					<FaCircleCheck className="h-8 w-8 text-white" strokeWidth={3} />
				</div>
			</div>
			<p className="mt-4 max-w-xs text-lg font-bold text-brand-dark">
				Vehicle Accident has been successfully reported.
			</p>
		</div>

		<div className="space-y-3 bg-white px-4 py-4">
			<Button type="button" variant="ghost" onClick={onGoHome} className="w-full">
				Go back to home
			</Button>
			<Button type="button" variant="outline" className="w-full" onClick={onCheckStatus}>
				Check Status
			</Button>
		</div>
	</div>
);

export default AccidentReportSuccess;
