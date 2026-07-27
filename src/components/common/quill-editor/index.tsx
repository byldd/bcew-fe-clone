"use client";

import { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import { cn } from "@/lib/utils/utils";

interface QuillEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	modules?: Record<string, unknown>;
	formats?: string[];
	theme?: string;
}

const defaultModules = {
	toolbar: [
		[{ header: [1, 2, false] }],
		["bold", "italic", "underline", "strike", "blockquote"],
		[{ list: "ordered" }, { list: "bullet" }],
		["link", "clean"],
	],
	clipboard: {
		matchVisual: false,
	},
};

const defaultFormats = ["header", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "link"];

const QuillEditor = ({
	value,
	onChange,
	placeholder,
	className,
	modules = defaultModules,
	formats = defaultFormats,
	theme = "snow",
}: QuillEditorProps) => {
	const isSyncingRef = useRef(false);
	const { quill, quillRef } = useQuill({
		theme,
		modules,
		formats,
		placeholder,
	});

	useEffect(() => {
		if (!quill) return;

		const handleTextChange = () => {
			if (isSyncingRef.current) return;

			const nextValue = quill.getText().trim().length === 0 ? "" : quill.root.innerHTML;
			onChange(nextValue);
		};

		quill.on("text-change", handleTextChange);

		return () => {
			quill.off("text-change", handleTextChange);
		};
	}, [onChange, quill]);

	useEffect(() => {
		if (!quill) return;

		const currentValue = quill.getText().trim().length === 0 ? "" : quill.root.innerHTML;

		if (currentValue === value) return;

		isSyncingRef.current = true;

		if (!value) {
			quill.setText("");
		} else {
			quill.clipboard.dangerouslyPasteHTML(value);
		}

		isSyncingRef.current = false;
	}, [quill, value]);

	return (
		<div className={cn("quill-editor overflow-visible px-0.5", className)}>
			<div ref={quillRef} />
		</div>
	);
};

export default QuillEditor;
