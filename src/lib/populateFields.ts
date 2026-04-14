import type { PDFForm, PDFFont } from "pdf-lib";
import { PDFName, PDFTextField } from "pdf-lib";
import { styleField } from "@utils/styleField";
import checkboxMap from "../data/checkboxMap.json";

interface Fonts {
	arialBold: PDFFont;
	arialNarrowBold: PDFFont;
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

	const gradeLevel = htmlFormValues.classified_as_grade;

	//Populate school/class info fields based of the HTML form
	const SKIP_FIELDS = [
		"file",
		"flatten",
		"passing_criteria",
		"promotion_criteria",
		"classified_as_grade",
	];

	for (const [htmlFieldName, value] of Object.entries(htmlFormValues)) {
		if (SKIP_FIELDS.includes(htmlFieldName)) continue;
		form
			.getTextField(`record_${gradeLevel}.${htmlFieldName}`)
			.setText(String(value || ""));
	}

	// Populate the remaining fields based on the CSV
	for (const [pdfFieldName, value] of Object.entries(csvRow)) {
		// Handle checkbox fields
		if (pdfFieldName === "credential_presented_for_grade_1") {
			for (const [label, fieldName] of Object.entries(checkboxMap)) {
				if (value === "All" || value.includes(label)) {
					form.getCheckBox(fieldName).check();
				}
			}
			continue;
		}

		// Handle remarks field based on final_rating
		if (pdfFieldName.startsWith(`record_${gradeLevel}.final_rating.`)) {
			const subjectCode = pdfFieldName.slice(
				`record_${gradeLevel}.final_rating.`.length,
			);
			form
				.getTextField(`record_${gradeLevel}.remarks.${subjectCode}`)
				.setText(
					Number(value) >= Number(htmlFormValues.passing_criteria)
						? "Passed"
						: "Failed",
				);
		}

		form.getTextField(pdfFieldName).setText(
			// For fields in the "learner." namespace, convert to uppercase.
			pdfFieldName.includes("learner.")
				? (value || "").toUpperCase()
				: value || "",
		);
	}

	// Handle special cases for school_id and general_remark
	form
		.getTextField("enrollment.school_id")
		.setText(csvRow["learner.lrn"]?.slice(0, 6) || "");
	form
		.getTextField(`record_${gradeLevel}.general_remark`)
		.setText(
			Number(csvRow[`record_${gradeLevel}.general_average`]) >=
				Number(htmlFormValues.promotion_criteria)
				? "Promoted"
				: "Retained",
		);

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

// feat: Populate 
