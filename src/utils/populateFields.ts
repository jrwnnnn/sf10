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
	row: Record<string, string>,
	fonts: Fonts,
) {
	console.log(`Creating SF10 for ${row["info.last_name"]}, ${row["info.first_name"]}...`);

	for (const [fieldName, value] of Object.entries(row)) {
		// Skip checkbox fields and the "credential_presented_for_grade_1" field for now
		if (
			fieldName.includes(".checkbox.") ||
			fieldName === "credential_presented_for_grade_1"
		)
			continue;

		const field = form.getTextField(fieldName);
		field.setAlignment(TextAlignment.Center);

		// Uppercase fields that start with "info."
		field.setText(
			fieldName.includes("info.") ? (value || "").toUpperCase() : value || "",
		);

		if (fieldName.includes("credential.")) {
			setFontSize(field, value, fonts.arialNarrowBold, 11);
			field.setAlignment(TextAlignment.Left);
			field.updateAppearances(fonts.arialNarrowBold);
		} else {
			setFontSize(field, value, fonts.arialBold, 12);
			field.updateAppearances(fonts.arialBold);
		}
	}

	const schoolIdField = form.getTextField("credential.school_id");
	schoolIdField.setText(row["info.lrn"]?.slice(0, 6) || "");
	schoolIdField.updateAppearances(fonts.arialBold);
}
