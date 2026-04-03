import type { PDFForm, PDFFont, PDFTextField } from "pdf-lib";
import { TextAlignment } from "pdf-lib";

export interface Fonts {
	arialBold: PDFFont;
	arialNarrowBold: PDFFont;
}

function setFontSize(
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

export async function populateFields(
	form: PDFForm,
	fonts: Fonts,
	csvRow: Record<string, string>,
) {
	console.log(
		`Creating SF10 for ${csvRow["info.last_name"]}, ${csvRow["info.first_name"]}...`,
	);

	for (const [pdfFieldName, value] of Object.entries(csvRow)) {
		// Skip checkbox fields and the "credential_presented_for_grade_1" field for now
		if (
			pdfFieldName.includes(".checkbox.") ||
			pdfFieldName === "credential_presented_for_grade_1"
		)
			continue;

		const pdfField = form.getTextField(pdfFieldName);
		pdfField.setAlignment(TextAlignment.Center);

		// Uppercase fields that start with "info."
		pdfField.setText(
			pdfFieldName.includes("info.")
				? (value || "").toUpperCase()
				: value || "",
		);

		if (pdfFieldName.includes("credential.")) {
			setFontSize(pdfField, value, fonts.arialNarrowBold, 11);
			pdfField.setAlignment(TextAlignment.Left);
			pdfField.updateAppearances(fonts.arialNarrowBold);
		} else {
			setFontSize(pdfField, value, fonts.arialBold, 12);
			pdfField.updateAppearances(fonts.arialBold);
		}
	}

	const schoolIdField = form.getTextField("credential.school_id");
	schoolIdField.setText(csvRow["info.lrn"]?.slice(0, 6) || "");
	schoolIdField.updateAppearances(fonts.arialBold);
}
