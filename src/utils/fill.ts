import type { PDFForm } from "pdf-lib";

export const fill = async (form: PDFForm, row: Record<string, string>) => {

	const setField = (pdfField: string, value: string) => {
		const field = form.getTextField(pdfField);
		field.setText(value || "");
	};

	const setCheck = (pdfField: string) => {
		const checkbox = form.getCheckBox(pdfField);
		checkbox.check();
	};

	console.log(`Creating an SF10 for ${row.first_name} ${row.last_name}...`);

	setField("info.lrn", row.lrn || "");
	setField("info.last_name", (row.last_name || "").toUpperCase());
	setField("info.first_name", (row.first_name || "").toUpperCase());
	setField("info.middle_name", (row.middle_name || "").toUpperCase());
	setField("info.extn", (row.extn || "").toUpperCase());
	setField("info.sex", (row.sex || "").toUpperCase());
	setField("info.birthdate", row.birthdate || "");

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

	setField("credential.name_of_school", row.school_name || "");
	setField("credential.school_id", row.lrn.slice(0, 6) || "");
	setField("credential.school_address", row.school_address || "");

	console.log("Done.");
};
