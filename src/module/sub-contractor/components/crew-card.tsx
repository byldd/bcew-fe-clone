"use client";

import { FiEdit } from "react-icons/fi";
import { SlTrash } from "react-icons/sl";
import { ISubContractorCrew } from "@/module/admin-sub-contractor/types";
import { UserType } from "@/module/profile/types";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export interface CrewCardProps extends ISubContractorCrew {
	onEdit?: () => void;
	onDelete?: () => void;
}

export default function CrewCard({
	name,
	crewLeaderName,
	email,
	phoneNumber,
	isAccessPaused,
	crewEmployees,
	onEdit,
	onDelete,
	deletedAt,
}: CrewCardProps) {
	const { user } = useAuthStore((state) => state);
	const isUser = Boolean((user as UserType["data"]["user"])?.id);
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	return (
		<div className="flex flex-col space-y-2 rounded-[10px] border border-brand-dark10 bg-white px-6 py-4 shadow-sm">
			<div className="flex items-start justify-between">
				<div>
					<div className="font-inter text-base font-medium text-brand-dark">{name}</div>
					<div className="flex justify-between text-xs font-medium text-brand-dark50">
						{crewEmployees?.length} {crewEmployees?.length > 1 ? tSub.members : tSub.member}
					</div>
				</div>

				{isUser && !deletedAt && (
					<div className="flex items-center gap-2">
						<button className="rounded hover:bg-gray-100" onClick={onEdit}>
							<FiEdit className="h-5 w-5" />
						</button>
						<button className="rounded hover:bg-gray-100" onClick={onDelete}>
							<SlTrash className="h-5 w-5 text-red-500" />
						</button>
					</div>
				)}
			</div>

			<div className="mt-2 flex justify-between text-xs font-medium text-brand-dark50">
				<span>{tSub.crewLeader}</span>
				<span>{tSub.access}</span>
			</div>

			<div className="!mt-0 flex items-center justify-between">
				<span className="text-sm font-medium text-brand-dark">{crewLeaderName}</span>
				<span className="text-sm font-medium text-brand-dark">{isAccessPaused ? tSub.paused : tSub.active}</span>
			</div>

			<div className="mt-2">
				<div className="text-xs font-medium text-brand-dark50">{tSub.emailId}</div>
				<div className="text-sm font-medium text-brand-dark">{email}</div>
			</div>

			<div className="mt-2">
				<div className="text-xs font-medium text-brand-dark50">{tSub.phoneNumber}</div>
				<div className="text-sm font-medium text-brand-dark">{phoneNumber}</div>
			</div>
		</div>
	);
}
