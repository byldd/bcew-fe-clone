import { ReactNode } from "react";

export const InfoNote = ({ children }: { children: ReactNode }) => (
	<div className="rounded-[8px] bg-[#9A6A001A] px-3 py-2 text-xs text-[#9A6A00]">{children}</div>
);
