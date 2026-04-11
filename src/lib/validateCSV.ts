import { updateProgressBanner } from "@utils/progressBanner";
import Papa from "papaparse";
import schema from "../data/schema.json";

const grade = 4;

export function validate(file: File): Promise<boolean> {
	return new Promise((resolve) => {
		// Check if the file is a CSV based on MIME type and extension
		if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
			console.error("Invalid file type. Expected CSV.");
			updateProgressBanner(
				"Invalid file type.",
				"Please upload a .csv file.",
				"https://cdn-icons-png.flaticon.com/512/6514/6514954.png",
			);
			return resolve(false);
		}

		Papa.parse(file, {
			header: true,
			comments: "#",
			skipEmptyLines: true,
			complete: (results) => {
				const columns = results.meta.fields;

				// Check for missing columns based on the grade schema
				const gradeSchema = schema.find((s) => s.grade === grade);
				const missingColumns = (gradeSchema ? gradeSchema.columns : []).filter(
					(col) => !columns!.includes(col),
				);
				if (missingColumns.length > 0) {
					let message = "";

					if (missingColumns.length > 5) {
						const shown = missingColumns.slice(0, 5).join(", ");
						message = `Missing columns: ${shown}, and ${missingColumns.length - 5} more...`;
					} else {
						message = `Missing columns: ${missingColumns.join(", ")}`;
					}

					console.error(
						`Invalid CSV. ${missingColumns.length} missing columns: ${missingColumns}`,
					);
					updateProgressBanner(
						"Invalid CSV.",
						message,
						"https://cdn-icons-png.flaticon.com/512/6514/6514954.png",
					);

					return resolve(false);
				}

				// Check if CSV is empty
				if (results.data.length === 0) {
					updateProgressBanner(
						"CSV is empty.",
						"The uploaded CSV file is empty.",
						"https://cdn-icons-png.flaticon.com/512/6514/6514954.png",
					);
					return resolve(false);
				}

				resolve(true);
			},
			error: (parseError) => {
				console.error("Error parsing CSV:", parseError);
				updateProgressBanner(
					"Error parsing CSV.",
					parseError.message as string,
					"https://cdn-icons-png.flaticon.com/512/6514/6514954.png",
				);
				resolve(false);
			},
		});
	});
}
