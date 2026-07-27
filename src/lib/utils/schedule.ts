function getJobNameBeforeNumber(input: string) {
	// Split input into words
	const words = input.split(" ");

	// Find index of first word that contains a number
	const index = words.findIndex((word) => /\d/.test(word));

	// If no number found, return whole input
	if (index === -1) return input.trim();

	// Join and return words before that
	return words.slice(0, index).join(" ").trim();
}

export { getJobNameBeforeNumber };
