import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { toFormattedDate } from "@/lib/utils/date";
import { IEmployeeTimeLogCardProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { DATE_FORMAT } from "@/types/date";

export function EmployeeTimeLogCard({ user }: IEmployeeTimeLogCardProps) {
	const ActiveFrom = user?.employee?.gpsLogData?.activeFrom;
	const ActiveTo = user?.employee?.gpsLogData?.activeTo;
	const isGpsTimeVisible = user?.employee?.user?.role?.trackTimeByGPS;
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-3">
				<Avatar className="h-6 w-6">
					<AvatarImage src="/assets/png/profile.png" alt={user?.employee?.user?.name ?? ""} />
					<AvatarFallback className="text-xs">JS</AvatarFallback>
				</Avatar>
				<h3 className="font-inter text-base font-medium text-brand-dark">{user?.employee?.user?.name}</h3>
			</div>

			<div className="grid grid-cols-2 gap-4 font-inter text-xs font-medium text-brand-dark50">
				{isGpsTimeVisible && (
					<>
						<div className="space-y-1">
							<p>{tEmployee.gpsStartTime}</p>
							<p className="font-inter text-sm font-medium text-brand-dark50">
								{ActiveFrom ? toFormattedDate(ActiveFrom, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
						<div className="space-y-1">
							<p>{tEmployee.gpsEndTime}</p>
							<p className="font-inter text-sm font-medium text-brand-dark50">
								{ActiveTo ? toFormattedDate(ActiveTo, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
					</>
				)}
				<div className="space-y-1">
					<p>Logged Start Time</p>
					<p className="font-inter text-sm font-medium text-brand-dark80">
						{user?.startTime ? toFormattedDate(user?.startTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
					</p>
				</div>
				<div className="space-y-1">
					<p>Logged End Time</p>
					<p className="font-inter text-sm font-medium text-brand-dark80">
						{user?.endTime ? toFormattedDate(user?.endTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
					</p>
				</div>
				{(user?.overrideStartTime || user?.overrideEndTime) && (
					<>
						<div className="space-y-1">
							<p>Override Start Time</p>
							<p className="font-inter text-sm font-medium text-brand-dark80">
								{user?.overrideStartTime ? toFormattedDate(user?.overrideStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
						<div className="space-y-1">
							<p>Override End Time</p>
							<p className="font-inter text-sm font-medium text-brand-dark80">
								{user?.overrideEndTime ? toFormattedDate(user?.overrideEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
