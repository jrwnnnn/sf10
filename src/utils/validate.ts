import { error } from "@utils/progress";
import Papa from "papaparse";

const REQUIRED_COLUMNS = [
	"lrn",
	"last_name",
	"first_name",
	"middle_name",
	"extn",
	"birthdate",
	"sex",
	"credential_presented_for_grade_1",
	"school_name",
	"school_address",
];

export function validate(file: File): Promise<boolean> {
	return new Promise((resolve) => {
		if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
			console.error("Invalid file type. Expected CSV.");
			error("Invalid file type.", "Please upload a .csv file.");
			return resolve(false);
		}

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const columns = results.meta.fields;
				const missing = REQUIRED_COLUMNS.filter(
					(col) => !columns!.includes(col),
				);

				if (missing.length > 0) {
					console.error(`Invalid CSV. Missing columns: ${missing.join(", ")}`);
					error("Invalid CSV.", `Missing columns: ${missing.join(", ")}`);
					return resolve(false);
				}

				if (results.data.length === 0) {
					error("CSV is empty.", "The uploaded CSV file is empty.");
					return resolve(false);
				}

				resolve(true);
			},
			error: (parseError) => {
				console.error("Error parsing CSV:", parseError);
				error("Error parsing CSV.", parseError.message as string);
				resolve(false);
			},
		});
	});
}
