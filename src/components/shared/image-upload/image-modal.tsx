"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";
import { FaArrowRotateRight } from "react-icons/fa6";

interface ImageModalProps {
	imageUrl: string | null;
	onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
	const [rotation, setRotation] = useState(0);

	if (!imageUrl) return null;

	return (
		<div onClick={onClose} className="relative flex h-full w-full flex-col items-center justify-center p-2">
			<div
				onClick={(e) => e.stopPropagation()}
				className="relative flex h-full w-full flex-col items-center justify-center bg-black/5"
			>
				<TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit={true} wheel={{ smoothStep: 0.01 }}>
					{({ zoomIn, zoomOut, resetTransform }) => (
						<>
							<div className="absolute right-4 top-4 z-50 flex gap-2 rounded-lg bg-black/50 p-2 text-white shadow-lg backdrop-blur-sm">
								<button
									onClick={() => zoomIn()}
									className="rounded-md p-2 transition-colors hover:bg-white/20 active:scale-95"
									title="Zoom In"
								>
									<ZoomIn size={20} />
								</button>
								<button
									onClick={() => zoomOut()}
									className="rounded-md p-2 transition-colors hover:bg-white/20 active:scale-95"
									title="Zoom Out"
								>
									<ZoomOut size={20} />
								</button>
								<button
									onClick={() => setRotation((prev) => prev + 90)}
									className="rounded-md p-2 transition-colors hover:bg-white/20 active:scale-95"
									title="Rotate"
								>
									<FaArrowRotateRight size={20} />
								</button>

								<button
									onClick={() => {
										resetTransform();
										setRotation(0);
									}}
									className="rounded-md p-2 transition-colors hover:bg-white/20 active:scale-95"
									title="Reset"
								>
									<RefreshCcw size={20} />
								</button>
							</div>
							<TransformComponent
								wrapperStyle={{ width: "100%", height: "100%" }}
								contentStyle={{
									width: "100%",
									height: "100%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<div
									className="relative h-[60vh] w-[90vw]"
									style={{
										transform: `rotate(${rotation}deg)`,
										transition: "transform 0.3s ease",
									}}
								>
									<Image
										src={imageUrl}
										alt="Full size preview"
										width={800}
										height={600}
										className="max-h-[80vh] items-center object-contain"
									/>
								</div>
							</TransformComponent>
						</>
					)}
				</TransformWrapper>
			</div>
		</div>
	);
};

export default ImageModal;
