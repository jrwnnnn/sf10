import type { PDFFont, PDFTextField } from "pdf-lib";

export function setFontSize(
	field: PDFTextField,
	value: string,
	font: PDFFont,
	maxSize = 12,
) {
	const widgets = field.acroField.getWidgets();
	const widget = widgets[0];
	const fieldWidth = widget.getRectangle().width;

	if (font.widthOfTextAtSize(value, maxSize) > fieldWidth) {
		field.setFontSize(0);
	} else {
		field.setFontSize(maxSize);
	}
}
