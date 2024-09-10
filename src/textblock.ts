// default settings for blocks
export const DefaultContainer = "parent";
export const DefaultFontSizeMinWidth = 1.0;
export const DefaultFontSizeMaxWidth = 1.8;
export const DefaultFontSizeUnits = "em";
export const DefaultLineHeightMinWidth = 1.33;
export const DefaultLineHeightMaxWidth = 1.25;
export const DefaultMinWidth = 320;
export const DefaultMaxWidth = 960;

// configuration options
export interface TextblockOptions {
	debounce?: number;
	debug?: boolean;
}

// represents an element that will be targeted
export interface TextblockTarget {
	container?: "parent" | "self";
	fontSizeMinWidth?: number;
	fontSizeMaxWidth?: number;
	fontSizeUnits?: "em" | "pt" | "px" | "rem";
	lineHeightMinWidth?: number;
	lineHeightMaxWidth?: number;
	minWidth?: number;
	maxWidth?: number;
	target: string;
	variableGradeMaxWidth?: number;
	variableGradeMinWidth?: number;
}

// textblock entrypoint
export const Textblock = (blocks: TextblockTarget[], options?: TextblockOptions) => {
	const { debounce = 200, debug = false } = options || ({} as TextblockOptions);

	if (typeof window !== "undefined") {
		const cancelHandles = onDocumentReady(() => {
			onLoad(blocks);
			return onResize(debounceCallback(() => onLoad(blocks), debounce));
		});
		return () => {
			if (typeof cancelHandles === "function") {
				cancelHandles();
			}
		};
	} else {
		console.error(
			"[Textblock] A valid DOM is required. If you're using SSR, be sure to initialize Textblock on the client."
		);

		return null;
	}

	// runs first pass recalculations
	function onDocumentReady(callback: () => void) {
		if (document.readyState === "complete") {
			callback();
		} else {
			window.addEventListener("load", () => callback());
		}

		return () => window.removeEventListener("load", callback);
	}

	// loops through all supplied blocks and applies changes to matching elements
	function onLoad(blocks: TextblockTarget[]) {
		if (blocks.length === 0) {
			debug && console.debug("[Textblock] No blocks were provided. Are you sure your configuration is correct?");
			return;
		}

		blocks.forEach((b) => {
			const elements = Array.from(document.querySelectorAll(b.target)).filter(
				(el): el is HTMLElement => el instanceof HTMLElement
			);

			debug && console.debug(`[Textblock] Found ${elements.length} elements matching the ${b.target} selector.`);

			elements.forEach((e) => {
				const measures = calculateTypographyMeasurements(b, e);
				if (measures) {
					e.style.fontSize = `${measures.fontSize}${b.fontSizeUnits}`;
					e.style.lineHeight = `${measures.lineHeight}`;
					measures.fontVariationSettings && (e.style.fontVariationSettings = measures.fontVariationSettings);
				}
			});
		});
	}

	// runs the recalculations on the window resize event
	function onResize(callback: (blocks: TextblockTarget[]) => void) {
		if (blocks.length === 0) {
			debug && console.debug("[Textblock] No blocks were provided. Are you sure your configuration is correct?");
			return;
		}

		window.addEventListener("resize", () => callback(blocks), true);

		return () => window.removeEventListener("resize", () => callback(blocks));
	}

	// calculates width, without padding and border width
	function calculateElementWidth(element?: HTMLElement | ParentNode | null) {
		if (!element) return 0;

		const node = element as HTMLElement;
		let width = 0;
		try {
			const paddingWidth =
				parseInt(computeElementStyle(node, "padding-left")) +
				parseInt(computeElementStyle(node, "padding-right"));

			const borderWidth =
				parseInt(computeElementStyle(node, "border-left-width")) +
				parseInt(computeElementStyle(node, "border-right-width"));

			width = node.offsetWidth - paddingWidth - borderWidth;
		} catch {
			debug && console.debug(`[TB] Node ${node.id} wasn't a valid HTML element. Assuming zero width.`);
		}

		return width;
	}

	// returns object with calculated fontSize and lineHeight for an element.
	function calculateTypographyMeasurements(block: TextblockTarget, element?: Element) {
		if (!element || !(element instanceof HTMLElement)) return undefined;

		const {
			container = DefaultContainer,
			fontSizeMaxWidth: fontMaxWidth = DefaultFontSizeMaxWidth,
			fontSizeMinWidth: fontMinWidth = DefaultFontSizeMinWidth,
			lineHeightMaxWidth: lineMaxWidth = DefaultLineHeightMaxWidth,
			lineHeightMinWidth: lineMinWidth = DefaultLineHeightMinWidth,
			maxWidth = DefaultMaxWidth,
			minWidth = DefaultMinWidth,
			variableGradeMaxWidth: vgMax,
			variableGradeMinWidth: vgMin
		} = block;

		const width = container === "self" ? calculateElementWidth(element) : calculateElementWidth(element.parentNode);
		const capped = Math.min(Math.max(width, minWidth), maxWidth); // caps container width to minWidth x maxWidth
		const widthRatio = (capped - minWidth) / (maxWidth - minWidth);
		const grade = vgMax && vgMin ? scaleInRange(vgMin, vgMax, widthRatio) : undefined;

		return {
			fontSize: scaleInRange(fontMinWidth, fontMaxWidth, widthRatio),
			lineHeight: scaleInRange(lineMinWidth, lineMaxWidth, widthRatio),
			fontVariationSettings: grade ? `"wght" ${grade}` : undefined
		};
	}

	// gets final calculated style values for element. For example, getting the final width or padding in px.
	function computeElementStyle(element: HTMLElement, style: string) {
		return window.getComputedStyle(element, null).getPropertyValue(style);
	}

	// used to debounce recalculation events to improve performance
	function debounceCallback(callback: (blocks: TextblockTarget[]) => void, delay: number) {
		let timeoutId: number | null;
		return (blocks: TextblockTarget[]) => {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = window.setTimeout(() => {
				callback(blocks);
			}, delay);
		};
	}

	// calculates a scale in the specified range
	function scaleInRange(min: number, max: number, factor: number) {
		return min + (max - min) * factor;
	}
};
