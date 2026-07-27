"use client";
import { useEffect, useRef } from "react";
import { IDropdownProps } from "../types/schedule-interface";

const Dropdown = ({ items, onItemClick, onClose, position }: IDropdownProps) => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	return (
		<div
			ref={dropdownRef}
			className="absolute z-50 w-56 rounded-lg border bg-white p-2 shadow-md"
			style={{ top: position.top, left: position.left }}
		>
			{items.map((item, index) => (
				<div
					key={index}
					className="cursor-pointer px-4 py-2 hover:bg-gray-100"
					onClick={() => {
						onItemClick(item);
						onClose();
					}}
				>
					{item}
				</div>
			))}
		</div>
	);
};

export default Dropdown;
