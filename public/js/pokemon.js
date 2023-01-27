document.addEventListener("DOMContentLoaded", () => {
	const primarySprite = document.getElementById("sprite-front");
	const secondarySprite = document.getElementById("sprite-back");

	const primaryLabel = document.getElementById("primarySupportText");
	const secondaryLabel = document.getElementById("secondarySupportText");

	if (!secondarySprite) {
		primarySprite.setAttribute("style", "height: 50%; width: 50%");
		return;
	}

	const primaryLabels = [];
	const secondaryLabels = [];

	if (secondarySprite.currentSrc.includes("/shiny/")) {
		primaryLabels.push("Regular");
		secondaryLabels.push("Shiny");
	}

	if (secondarySprite.currentSrc.includes("/female/")) {
		primaryLabels.push("Male");
		secondaryLabels.push("Female");
	}

	if (secondarySprite.currentSrc.includes("/back/")) {
		primaryLabels.push("Front");
		secondaryLabels.push("Back");
	}

	primaryLabel.innerHTML = primaryLabels.join(" ");
	secondaryLabel.innerHTML = secondaryLabels.join(" ");

	adjustShowcaseSprites(primarySprite);
	adjustShowcaseSprites(secondarySprite);

	if (
		primarySprite.currentSrc.includes(".gif") &&
		secondarySprite.currentSrc.includes(".gif")
	) {
		const gifStates = [false, false];
		primarySprite.addEventListener("load", () => {
			gifStates[0] = true;
			reloadGifs(gifStates, [primarySprite, secondarySprite]);
		});

		secondarySprite.addEventListener("load", () => {
			gifStates[1] = true;
			reloadGifs(gifStates, [primarySprite, secondarySprite]);
		});
	}
});

const loadedGifs = [false, false];
const reloadGifs = (states, all) => {
	const loaded = states.every(state => state === true);
	if (loaded) {
		all.forEach((sprite, i) => {
			if (loadedGifs[i] === false) {
				const actualURL = sprite.currentSrc;
				sprite.src = "";
				sprite.src = actualURL;
				loadedGifs[i] = true;
			}
		});
	}
};

const adjustShowcaseSprites = sprite => {
	if (sprite.currentSrc.includes("/ultra-sun-ultra-moon")) {
		sprite.setAttribute("style", "height: 85%; width: 85%");
		sprite.classList.add("is-square");
	}

	if (
		sprite.currentSrc.includes("/red-blue/") ||
		sprite.currentSrc.includes("/yellow/") ||
		sprite.currentSrc.includes("/ruby-sapphire/") ||
		sprite.currentSrc.includes("/emerald/") ||
		sprite.currentSrc.includes("/firered-leafgreen/") ||
		sprite.currentSrc.includes("/diamond-pearl/") ||
		sprite.currentSrc.includes("/platinum/") ||
		sprite.currentSrc.includes("/heartgold-soulsilver/") ||
		sprite.currentSrc.includes(".gif") ||
		sprite.currentSrc.includes("/x-y/")
	) {
		sprite.setAttribute("style", "height: 70%; width: 70%");
		sprite.classList.add("is-square");
	}
};
