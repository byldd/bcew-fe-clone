export const SidebarItemBadge = ({ count }: { count: number }) => {
	if (count <= 0) return null;

	return (
		<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
			{count}
		</span>
	);
};
