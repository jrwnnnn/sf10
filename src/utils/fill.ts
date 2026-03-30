import type { PDFForm, PDFFont } from "pdf-lib";

export interface Fonts {
	arial: PDFFont;
	arialBold: PDFFont;
	arialNarrow: PDFFont;
	arialNarrowBold: PDFFont;
}

export const fill = async (
	form: PDFForm,
	row: Record<string, string>,
	fonts: Fonts,
) => {
	const setField = (pdfField: string, value: string, font: PDFFont) => {
		const field = form.getTextField(pdfField);
		field.setText(value || ""); // set value first
		field.updateAppearances(font); // then lock in the font
	};

	const setCheck = (pdfField: string) => {
		form.getCheckBox(pdfField).check();
	};

	console.log(`Creating SF10 for ${row.first_name} ${row.last_name}...`);

	setField("info.lrn", row.lrn || "", fonts.arialBold);
	setField(
		"info.last_name",
		(row.last_name || "").toUpperCase(),
		fonts.arialBold,
	);
	setField(
		"info.first_name",
		(row.first_name || "").toUpperCase(),
		fonts.arialBold,
	);
	setField(
		"info.middle_name",
		(row.middle_name || "").toUpperCase(),
		fonts.arialBold,
	);
	setField("info.extn", (row.extn || "").toUpperCase(), fonts.arialBold);
	setField("info.sex", (row.sex || "").toUpperCase(), fonts.arialBold);
	setField("info.birthdate", row.birthdate || "", fonts.arialBold);

	switch (row.credential_presented_for_grade_1) {
		case "Kinder Progress Report":
			setCheck("credential.checkbox.kinder_progress_report");
			break;
		case "ECCD Checklist":
			setCheck("credential.checkbox.eccd_checklist");
			break;
		case "Kindergarten Certificate of Completion":
			setCheck("credential.checkbox.kindergarten_certificate_of_completion");
			break;
	}

	setField(
		"credential.name_of_school",
		row.school_name || "",
		fonts.arialNarrowBold,
	);
	setField(
		"credential.school_id",
		row.lrn.slice(0, 6) || "",
		fonts.arialNarrowBold,
	);
	setField(
		"credential.school_address",
		row.school_address || "",
		fonts.arialNarrowBold,
	);
};
