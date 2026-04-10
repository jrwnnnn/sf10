import type { PDFForm, PDFFont } from "pdf-lib";
import { PDFName, PDFTextField, TextAlignment } from "pdf-lib";
import checkboxMap from "../data/checkboxMap.json";

export interface Fonts {
	arialBold: PDFFont;
	arialNarrowBold: PDFFont;
}

function applyFieldStyle(
	field: PDFTextField,
	fonts: Fonts,
	pdfFieldName: string,
): void {
	if (pdfFieldName.startsWith("credential.")) {
		field.setFontSize(11);
		field.setAlignment(TextAlignment.Left);
		field.updateAppearances(fonts.arialNarrowBold);
	} else {
		field.setFontSize(12);
		field.setAlignment(TextAlignment.Center);
		field.updateAppearances(fonts.arialBold);
	}
}

export async function populateFields(
	form: PDFForm,
	fonts: Fonts,
	classInfo: Record<string, string>,
	csvRow: Record<string, string>,
) {
	console.log(
		`Creating SF10 for ${csvRow["info.last_name"]}, ${csvRow["info.first_name"]}...`,
	);

	for (const field of form.getFields()) {
		// Scrape /AP and seed missing /DA
		if (!(field instanceof PDFTextField)) continue;
		field.acroField.dict.delete(PDFName.of("AP"));
		if (!field.acroField.getDefaultAppearance()) {
			field.acroField.setDefaultAppearance("/Arial 12 Tf 0 g");
		}
		// Pre-style all fields so they won't fall back to Helvetica.
		applyFieldStyle(field, fonts, field.getName());
	}

	// Populate school and class info fields based of the HTML form inputs
	for (const [htmlFieldName, value] of Object.entries(classInfo)) {
		const pdfFieldName = `scholastic_${classInfo.classified_as_grade}.${htmlFieldName}`;
		const pdfField = form.getTextField(pdfFieldName);
		pdfField.setText(value || "");
		applyFieldStyle(pdfField, fonts, pdfFieldName);
	}

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
			pdfFieldName.includes("info.")
				? (value || "").toUpperCase()
				: value || "",
		);
		applyFieldStyle(pdfField, fonts, pdfFieldName);
	}

	const schoolIdField = form.getTextField("credential.school_id");
	schoolIdField.setText(csvRow["info.lrn"]?.slice(0, 6) || "");
	applyFieldStyle(schoolIdField, fonts, "credential.school_id");

	
}
