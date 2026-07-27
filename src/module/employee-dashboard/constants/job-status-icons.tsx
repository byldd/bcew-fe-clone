import { FaCarAlt } from "react-icons/fa";
import { FaCircleMinus, FaHelmetSafety, FaRegCalendar, FaUserGroup, FaWrench } from "react-icons/fa6";
import { BsBoxFill, BsFillFlagFill } from "react-icons/bs";
import { RiGraduationCapFill, RiProgress3Line } from "react-icons/ri";
import { MdCircle, MdLockOutline } from "react-icons/md";
import { IoCall, IoCheckbox } from "react-icons/io5";
import { PiWarningFill } from "react-icons/pi";
import React from "react";
import { JobStatus } from "@/module/employee-dashboard/types";
import { legends } from "./legend-items";
import { CheckSquare2Icon } from "lucide-react";
import Image from "next/image";

export const statusIcons: Record<JobStatus, React.ReactNode> = {
	[legends.newStart]: <MdCircle className="h-3 w-3 rounded-full text-brand-greenAccent" />,
	[legends.ongoingJob]: <RiProgress3Line className="h-3 w-3 text-gray-500" />,
	[legends.lockedJob]: <MdLockOutline className="h-3 w-3 text-gray-700" />,
	[legends.subContractorJob]: <FaHelmetSafety className="h-3 w-3 text-blue-400" />,
	[legends.completed]: <IoCheckbox className="h-3 w-3 text-violet-500" />,
	[legends.carryOveredJob]: <BsFillFlagFill className="h-3 w-3 text-red-500" />,
	[legends.travelRelatedJob]: <FaCarAlt className="h-3 w-3 text-gray-700" />,
	[legends.validationWarning]: <PiWarningFill className="h-3 w-3 text-yellow-500" />,
	[legends.jobNotReady]: <FaCircleMinus className="h-3 w-3 text-red-500" />,
	[legends.autoRescheduledJob]: <FaRegCalendar className="h-3 w-3 text-blue-400" />,
	[legends.manualOverride]: <FaWrench className="h-3 w-3 text-gray-700" />,
	[legends.training]: <RiGraduationCapFill className="h-3 w-3 text-pink-500" />,
	[legends.shadowing]: <FaUserGroup className="h-3 w-3 text-gray-500" />,
	[legends.builderUpdateTriggered]: <IoCall className="h-3 w-3 text-blue-500" />,
	[legends.materialDependent]: <BsBoxFill className="h-3 w-3 text-blue-900" />,
	[legends.warrantyJob]: <FaWrench className="h-3 w-3 text-brand-copper" />,
	[legends.qcJob]: <CheckSquare2Icon className="h-3 w-3 text-purple-500" />,
	[legends.rescheduledJob]: (
		<Image src="/assets/svg/reschedule-legend.svg" alt="calendar-sync" width={18} height={18} className="h-4 w-4" />
	),
};
