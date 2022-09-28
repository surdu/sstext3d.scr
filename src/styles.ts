const style = /*css*/ `
	#ss3dtext-wrapper {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0
	}

	body.SS3dTextActive {
		overflow: hidden;
	}
`;

export default function addStyles() {
	const styleEl = document.createElement("style");
	styleEl.innerHTML = style;
	document.head.appendChild(styleEl);
}
