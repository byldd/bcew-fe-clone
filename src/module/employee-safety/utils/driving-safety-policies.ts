export const toRequiredDocs = (documentationRequired: string): string[] =>
	documentationRequired
		.split(",")
		.map((doc) => doc.trim())
		.filter(Boolean);

export const formatPoints = (points: number | null): string => {
	if (points === null) return "TBD";
	return points === 1 ? "1 pt" : `${points} pts`;
};
