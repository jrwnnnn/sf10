// This module provides a function to update the progress banner displayed during the file generation process.
// It allows you to set the header text, subheader text, and image URL to provide feedback to the user about the current status of the operation.

const progressContainer = document.getElementById("progress-banner") as HTMLDivElement;
const header = document.querySelector("#progress-banner div h1") as HTMLHeadingElement;
const subheader = document.querySelector(
	"#progress-banner div p",
) as HTMLParagraphElement;
const image = document.querySelector("#progress-banner img") as HTMLImageElement;

function showProgress() {
	progressContainer.classList.remove("hidden");
	progressContainer.classList.add("flex");
}

export function updateProgressBanner(
	headerText = "Processing...",
	subheaderText = "Feel free to keep working while we generate the files in the background.",
	imageUrl = "https://i.pinimg.com/originals/88/71/4a/88714a27c1a6c90148b5793a4b8ad8cb.gif",
) {
	header.textContent = headerText;
	subheader.textContent = subheaderText;
	image.src = imageUrl;
	showProgress();
}
