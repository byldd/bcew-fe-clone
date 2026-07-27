"use client";

import useAuthStore from "@/store/auth-store";
import { IProfileModalProps } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export default function ProfileModal({ onClose }: IProfileModalProps) {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	return (
		<div className="rounded-[20px]">
			{user && user?.bcewUser ? (
				<div className="flex-col items-center gap-2 space-y-2">
					<div className="my-4 flex">
						<Avatar className="h-10 w-10 rounded-full shadow-lg">
							<AvatarImage src="/assets/png/profile.png" alt="User" />
							<AvatarFallback className="bg-white">JS</AvatarFallback>
						</Avatar>

						<p className="mt-2 px-2 font-inter text-base font-semibold text-brand-dark">
							{user?.bcewUser?.EmployeeName}
						</p>
					</div>

					<div className="space-y-3 text-sm text-gray-700">
						<div className="space-y-1">
							<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.emailId}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">{user?.bcewUser?.e_mail}</p>
						</div>

						<div className="space-y-1">
							<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.phone}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">{user?.bcewUser?.CellNumber}</p>
						</div>
						{user?.bcewUser?.Class && (
							<div className="space-y-1">
								<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.role}</p>
								<p className="font-inter text-sm font-medium text-brand-dark">{user?.bcewUser?.Class}</p>
							</div>
						)}
						{user?.bcewUser?.dptnme && (
							<div className="space-y-1">
								<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.department}</p>
								<p className="font-inter text-sm font-medium text-brand-dark">{user?.bcewUser?.dptnme}</p>
							</div>
						)}
					</div>
				</div>
			) : subcontractorCrew ? (
				<div className="rounded-[20px]">
					<div className="mb-4 flex">
						<Avatar className="h-10 w-10 rounded-full shadow-lg">
							<AvatarImage src="/assets/png/profile.png" alt="User" />
							<AvatarFallback className="bg-white">JS</AvatarFallback>
						</Avatar>

						<p className="mt-2 px-2 font-inter text-base font-semibold text-brand-dark">
							{subcontractorCrew?.crewLeaderName}
						</p>
					</div>

					<div className="space-y-4 text-sm text-gray-700">
						<div className="space-y-1">
							<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.emailId}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">{subcontractorCrew?.email}</p>
						</div>

						<div className="space-y-1">
							<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.phone}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">{subcontractorCrew?.phoneNumber}</p>
						</div>

						<div className="space-y-1">
							<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.role}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">Crew Leader</p>
						</div>

						<div className="space-y-1">
							<p className="font-inter text-xs font-normal text-brand-grey">{tCommon.crew}</p>
							<p className="font-inter text-sm font-medium text-brand-dark">{subcontractorCrew?.name}</p>
						</div>
					</div>
				</div>
			) : (
				// Ideally this situation will never occur
				<div>{tCommon.userDetailsNotFound}</div>
			)}

			{/* <div className="my-4 space-y-1">
				<Label className="text-xs font-normal text-brand-grey">{tCommon.language}</Label>
				<LanguageToggle />
			</div> */}
		</div>
	);
}
