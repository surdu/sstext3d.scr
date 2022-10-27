import ScreenSaver3DText, { Animation } from "..";

document.getElementById("form")?.addEventListener("submit", (event) => {
	event.preventDefault();

	const formData = new FormData(event.target as HTMLFormElement);
	const data = Object.fromEntries(formData);
	const ss3d = new ScreenSaver3DText({
		text: data.text as string,
		animation: data.animation as Animation,
		rotationSpeed: 1.1 - parseFloat(data.speed as string),
	});
	ss3d.start();
});
