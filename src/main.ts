import ScreenSaver3DText, { Animation, timeText } from "./SS3dtext";

document.getElementById("form")?.addEventListener("submit", (event) => {
	event.preventDefault();

	const formData = new FormData(event.target as HTMLFormElement);
	const data = Object.fromEntries(formData);
	const ss3d = new ScreenSaver3DText({
		text: data.text as string,
		animation: data.animation as Animation,
	});
	ss3d.start();
});
