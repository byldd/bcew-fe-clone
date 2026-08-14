"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AxiosError } from "axios";
import { useState } from "react";

const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: (failureCount, error) => {
					const status = (error as AxiosError)?.response?.status;
					// Never retry client/auth errors (4xx) — they won't succeed on retry
					// and would just hammer the server.
					if (status && status >= 400 && status < 500) return false;
					// Retry transient network/5xx errors a couple of times before giving up.
					return failureCount < 2;
				},
				retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
			},
		},
	});

export default function Provider({ children }: { children: React.ReactNode }) {
	const [client] = useState(createQueryClient);

	return (
		<QueryClientProvider client={client}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
