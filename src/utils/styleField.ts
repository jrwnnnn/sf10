import type { PDFFont } from "pdf-lib";
import { PDFTextField, TextAlignment } from "pdf-lib";

interface Fonts {
	arialBold: PDFFont;
	arialNarrowBold: PDFFont;
}

function shrinkToFit(
	text: string,
	font: PDFFont,
	maxSize: number,
	fieldWidth: number,
	minSize = 6,
): number {
	if (!text) return maxSize;
	for (let size = maxSize; size >= minSize; size -= 1) {
		if (font.widthOfTextAtSize(text, size) <= fieldWidth) {
			return size;
		}
	}
	return minSize;
}

export function styleField(
	field: PDFTextField,
	fonts: Fonts,
	pdfFieldName: string,
): void {
	const text = field.getText() ?? "";
	const fieldWidth =
		field.acroField.getWidgets()[0]?.getRectangle().width ?? Infinity;

	if (pdfFieldName.startsWith("enrollment.")) {
		field.setFontSize(shrinkToFit(text, fonts.arialNarrowBold, 11, fieldWidth));
		field.setAlignment(TextAlignment.Left);
		field.updateAppearances(fonts.arialNarrowBold);
	} else {
		field.setFontSize(shrinkToFit(text, fonts.arialBold, 12, fieldWidth));
		field.setAlignment(TextAlignment.Center);
		field.updateAppearances(fonts.arialBold);
	}
}
