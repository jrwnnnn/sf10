const progressContainer = document.getElementById("progress") as HTMLDivElement;
const header = document.querySelector("#progress div h1") as HTMLHeadingElement;
const subheader = document.querySelector(
	"#progress div p",
) as HTMLParagraphElement;
const image = document.querySelector("#progress img") as HTMLImageElement;

function showProgress() {
	progressContainer.classList.remove("hidden");
	progressContainer.classList.add("flex");
}

export function progress(
	headerText = "Processing...",
	subheaderText = "Feel free to keep working while we generate the files in the background.",
	imageUrl = "https://i.pinimg.com/originals/88/71/4a/88714a27c1a6c90148b5793a4b8ad8cb.gif",
) {
	header.textContent = headerText;
	subheader.textContent = subheaderText;
	image.src = imageUrl;
	console.log(headerText);
	showProgress();
}

export function error(
	headerText = "An error occurred.",
	subheaderText = "An error occurred while processing your request. Please try again.",
) {
	header.textContent = headerText;
	subheader.textContent = subheaderText;
	image.src = "https://cdn-icons-png.flaticon.com/512/6514/6514954.png";
	showProgress();
}
