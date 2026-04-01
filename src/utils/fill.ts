import type { PDFForm, PDFFont } from "pdf-lib";
import { TextAlignment } from "pdf-lib";

export interface Fonts {
	arialBold: PDFFont;
	arialNarrowBold: PDFFont;
}

export const fill = async (
	form: PDFForm,
	row: Record<string, string>,
	fonts: Fonts,
) => {
	function setField(
		acroformField: string,
		value: string,
		font: PDFFont,
		alignment = TextAlignment.Left,
	) {
		const field = form.getTextField(acroformField);
		field.setAlignment(alignment);
		field.setText(value || "");
		field.updateAppearances(font);
	}

	function tick(acroformField: string) {
		form.getCheckBox(acroformField).check();
	}

	setField("info.lrn", row.lrn || "", fonts.arialBold, TextAlignment.Center);
	setField(
		"info.last_name",
		(row.last_name || "").toUpperCase(),
		fonts.arialBold,
		TextAlignment.Center,
	);
	setField(
		"info.first_name",
		(row.first_name || "").toUpperCase(),
		fonts.arialBold,
		TextAlignment.Center,
	);
	setField(
		"info.middle_name",
		(row.middle_name || "").toUpperCase(),
		fonts.arialBold,
		TextAlignment.Center,
	);
	setField(
		"info.extn",
		(row.extn || "").toUpperCase(),
		fonts.arialBold,
		TextAlignment.Center,
	);
	setField(
		"info.sex",
		(row.sex || "").toUpperCase(),
		fonts.arialBold,
		TextAlignment.Center,
	);
	setField(
		"info.birthdate",
		row.birthdate || "",
		fonts.arialBold,
		TextAlignment.Center,
	);
	switch (row.credential_presented_for_grade_1) {
		case "Kinder Progress Report":
			tick("credential.checkbox.kinder_progress_report");
			break;
		case "ECCD Checklist":
			tick("credential.checkbox.eccd_checklist");
			break;
		case "Kindergarten Certificate of Completion":
			tick("credential.checkbox.kindergarten_certificate_of_completion");
			break;
	}

	setField(
		"credential.name_of_school",
		row.school_name || "",
		fonts.arialNarrowBold,
	);
	setField(
		"credential.school_id",
		row.lrn?.slice(0, 6) || "",
		fonts.arialNarrowBold,
	);
	setField(
		"credential.school_address",
		row.school_address || "",
		fonts.arialNarrowBold,
	);
};
