import type { Metadata } from "next";
import "@/app/globals.css";
import "quill/dist/quill.snow.css";
import Provider from "@/components/providers/query-client-provider";
import { PushNotificationProvider } from "@/components/providers/push-notification-provider";
import { Toaster } from "react-hot-toast";
import { nordique, tahoma, inter } from "@/app/fonts";
import { cn } from "@/lib/utils/utils";
import { Suspense } from "react";
import getRequestConfig from "@/i18n/request";
import { NextIntlClientProvider } from "next-intl";
import { env } from "@/env.mjs";
import { ENV } from "@/utils/enums";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthRoleBanner from "@/components/auth-role-banner";

export const metadata: Metadata = {
	title: "BCEW",
	description: "Bucks County Electric Works",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { locale, messages } = await getRequestConfig();

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn(nordique.variable, tahoma.variable, inter.variable)}>
				<Suspense>
					<Provider>
						<NextIntlClientProvider locale={locale} messages={messages}>
							<PushNotificationProvider>
								<TooltipProvider>
									<div className="relative">
										<div className="absolute right-3 top-1 z-[9999] flex items-center gap-3">
											<AuthRoleBanner />

											{env.NEXT_PUBLIC_ENV !== ENV.PRODUCTION && (
												<div className="flex items-center gap-1 text-green-600">
													<div className="h-2 w-2 rounded-full bg-green-600" />
													<p className="text-xs font-semibold capitalize">{env.NEXT_PUBLIC_ENV}</p>
												</div>
											)}
										</div>

										{children}
									</div>
									<Toaster />
								</TooltipProvider>
							</PushNotificationProvider>
						</NextIntlClientProvider>
					</Provider>
				</Suspense>
			</body>
		</html>
	);
}
