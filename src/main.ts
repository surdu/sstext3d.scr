import ScreenSaver3DText, { Animation, timeText } from "./SS3dtext";

const ss3d = new ScreenSaver3DText({
	text: "Text",
});

document
	.getElementById("startBtn")
	?.addEventListener("click", ss3d.start.bind(ss3d));
