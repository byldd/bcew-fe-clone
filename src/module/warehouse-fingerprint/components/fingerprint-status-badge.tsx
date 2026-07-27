interface Props {
	count: number;
}

export default function FingerprintStatusBadge({ count }: Props) {
	if (count === 2) {
		return (
			<span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
				✓ Enrolled
			</span>
		);
	}

	return (
		<span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
			Not Enrolled
		</span>
	);
}
