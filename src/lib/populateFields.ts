import type { PDFForm, PDFFont } from "pdf-lib";
import { PDFName, PDFTextField, TextAlignment } from "pdf-lib";
import checkboxMap from "../data/checkboxMap.json";

export interface Fonts {
	arialBold: PDFFont;
	arialNarrowBold: PDFFont;
}

function shrinkToFit(
	text: string,
	font: PDFFont,
	maxSize: number,
	fieldWidth: number,
	minSize = 6,
	step = 0.5,
): number {
	if (!text) return maxSize;
	for (let size = maxSize; size >= minSize; size -= step) {
		if (font.widthOfTextAtSize(text, size) <= fieldWidth) {
			return size;
		}
	}
	return minSize;
}

function styleField(
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

export async function populateFields(
	form: PDFForm,
	fonts: Fonts,
	htmlFormValues: Record<string, FormDataEntryValue>,
	csvRow: Record<string, string>,
) {
	console.log(
		`Creating SF10 for ${csvRow["learner.last_name"]}, ${csvRow["learner.first_name"]}...`,
	);

	//Populate school and class info fields based of the HTML form
	const skipFields = [
		"file",
		"flatten",
		"passing_criteria",
		"promotion_criteria",
		"classified_as_grade",
	];

	for (const [htmlFieldName, value] of Object.entries(htmlFormValues)) {
		if (skipFields.includes(htmlFieldName)) continue;
		const pdfFieldName = `record_${htmlFormValues.classified_as_grade}.${htmlFieldName}`;
		const pdfField = form.getTextField(pdfFieldName);
		pdfField.setText(String(value || ""));
	}

	// Populate the remaining fields based on the CSV
	for (const [pdfFieldName, value] of Object.entries(csvRow)) {
		// Handle checkbox fields
		if (pdfFieldName === "credential_presented_for_grade_1") {
			for (const [label, fieldName] of Object.entries(checkboxMap)) {
				const checkbox = form.getCheckBox(fieldName);
				if (value === "All" || value.includes(label)) {
					checkbox.check();
				}
			}
			continue;
		}

		const pdfField = form.getTextField(pdfFieldName);
		pdfField.setText(
			// For fields in the "learner." namespace, convert to uppercase.
			pdfFieldName.includes("learner.")
				? (value || "").toUpperCase()
				: value || "",
		);
	}

	const schoolIdField = form.getTextField("enrollment.school_id");
	schoolIdField.setText(csvRow["learner.lrn"]?.slice(0, 6) || "");

	// Scrape /AP and seed missing /DA for all text fields, then apply styling
	for (const field of form.getFields()) {
		if (!(field instanceof PDFTextField)) continue;
		field.acroField.dict.delete(PDFName.of("AP"));
		if (!field.acroField.getDefaultAppearance()) {
			field.acroField.setDefaultAppearance("/Arial 12 Tf 0 g");
		}
		styleField(field, fonts, field.getName());
	}
}
