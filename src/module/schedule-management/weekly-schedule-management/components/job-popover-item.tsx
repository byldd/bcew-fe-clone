type PopoverItemProps = {
	label: string;
	onClick: () => void;
	className?: string;
};

const JobPopoverItem: React.FC<PopoverItemProps> = ({ label, onClick, className = "" }) => {
	return (
		<p
			className={`cursor-pointer border-b border-brand-dark10 p-2 text-[13px] font-medium ${className}`}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onClick();
			}}
		>
			{label}
		</p>
	);
};

export default JobPopoverItem;
