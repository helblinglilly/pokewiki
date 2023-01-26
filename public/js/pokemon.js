document.addEventListener("DOMContentLoaded", () => {
	const primarySprite = document.getElementById("sprite-front");
	const primaryLabel = document.getElementById("primarySupportText");
	const secondarySprite = document.getElementById("sprite-back");
	const secondaryLabel = document.getElementById("secondarySupportText");

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

	primaryLabel.innerHTML = primaryLabels.join(" ");
	secondaryLabel.innerHTML = secondaryLabels.join(" ");

	adjustShowcaseSprites(primarySprite);
	adjustShowcaseSprites(secondarySprite);
});

const adjustShowcaseSprites = sprite => {
	if (sprite.currentSrc.includes(".gif")) {
		sprite.classList.add("p-6");
		sprite.classList.add("is-square");
	}

	if (sprite.currentSrc.includes("/ultra-sun-ultra-moon")) {
		sprite.classList.add("is-square");
	}

	if (
		sprite.currentSrc.includes("/ruby-sapphire/") ||
		sprite.currentSrc.includes("/emerald/") ||
		sprite.currentSrc.includes("/firered-leafgreen/") ||
		sprite.currentSrc.includes("/diamond-pearl/") ||
		sprite.currentSrc.includes("/platinum/") ||
		sprite.currentSrc.includes("/heartgold-soulsilver/")
	) {
		sprite.classList.add("p-5");
		sprite.classList.add("is-square");
	}

	if (
		sprite.currentSrc.includes("/red-blue/") ||
		sprite.currentSrc.includes("/yellow/") ||
		sprite.currentSrc.includes("/x-y/")
	) {
		sprite.classList.add("p-6");
	}
};
