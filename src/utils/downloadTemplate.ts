import { saveAs } from "file-saver";

const templateSelect = document.getElementById(
	"template-select",
) as HTMLSelectElement;

templateSelect.addEventListener("change", function () {
	const fileUrl = this.value;
	if (fileUrl) {
		const fileName = fileUrl.split("/").pop();
		saveAs(fileUrl, fileName);
	}
});
