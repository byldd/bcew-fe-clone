export interface FingerprintSampleAcquiredEvent {
	samples: string;
}

export interface FingerprintWebApi {
	onDeviceConnected?: () => void;
	onDeviceDisconnected?: () => void;
	onCommunicationFailed?: () => void;
	onAcquisitionStarted?: () => void;
	onAcquisitionStopped?: () => void;
	onSamplesAcquired?: (event: FingerprintSampleAcquiredEvent) => Promise<void> | void;
	startAcquisition: (format: unknown) => Promise<void>;
	stopAcquisition: () => Promise<void>;
	enumerateDevices: () => Promise<unknown[]>;
	off?: () => void;
}

export interface FingerprintGlobal {
	WebApi: new () => FingerprintWebApi;
	b64UrlToUtf8: (value: string) => string;
	SampleFormat: {
		PngImage: unknown;
	};
}

declare global {
	interface Window {
		Fingerprint: FingerprintGlobal;
	}
}
