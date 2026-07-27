"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthWrapperOneType } from "@/module/auth/types";
import { useEffect, useRef } from "react";

export default function AuthWrapperOne({ children, title, termsAndConditions }: AuthWrapperOneType) {
	const authPopupRef = useRef<Window | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Capture the current values at the time the effect is created
		const interval = intervalRef.current;
		const popup = authPopupRef.current;

		return () => {
			if (interval) clearInterval(interval);
			if (popup?.closed === false) {
				popup.close();
			}
			authPopupRef.current = null;
		};
	}, []);

	return (
		<>
			<div className="flex flex-col items-center justify-center gap-6 bg-muted py-0">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-6">
						<Card>
							<CardHeader className="pt-0 text-start">
								<CardTitle className="text-xl font-normal">{title}</CardTitle>
							</CardHeader>
							<CardContent className="py-5 pt-0">
								<div className="grid gap-6">{children}</div>
							</CardContent>
						</Card>
						{termsAndConditions}
					</div>
				</div>
			</div>
		</>
	);
}
