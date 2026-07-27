const PALETTE = ["#62CD32", "#3B82F6", "#F97316", "#8B5CF6", "#14B8A6", "#EC4899", "#EAB308", "#EF4444"];

// Tabs/types are admin-created now (not a fixed enum), so colors are hashed from the id
// instead of a hardcoded lookup map - see docs/project-map.md §4.4.
export const getZoneColor = (id: string): string => {
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = (hash << 5) - hash + id.charCodeAt(i);
		hash |= 0;
	}
	return PALETTE[Math.abs(hash) % PALETTE.length]!;
};
