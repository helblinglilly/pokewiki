window.onload = () => {
	var gifs = Gifffer();

	setTimeout(function () {
		gifs.forEach(gif => {
			gif.click();
		});
	}, 100);
};

document.addEventListener("DOMContentLoaded", () => {
	const spritesLoaded = [false, false];
	document.getElementById("sprite-front").addEventListener("load", () => {
		spritesLoaded[0] = true;
		if (!spritesLoaded.includes(false)) {
			initialiseSprites();
		}
	});
	document.getElementById("sprite-back").addEventListener("load", () => {
		spritesLoaded[1] = true;
		if (!spritesLoaded.includes(false)) {
			initialiseSprites();
		}
	});
});

const initialiseSprites = () => {
	const frontSprite = document.getElementById("sprite-front");
	const backSprite = document.getElementById("sprite-back");
	const frontLabel = document.getElementById("primarySupportText");
	const backLabel = document.getElementById("secondarySupportText");

	const frontLabels = [];
	const backLabels = [];

	if (backSprite.currentSrc.includes("/shiny/")) {
		frontLabels.push("Regular");
		backLabels.push("Shiny");
	}

	if (backSprite.currentSrc.includes("/female/")) {
		frontLabels.push("Male");
		backLabels.push("Female");
	}

	if (backSprite.currentSrc.includes("/back/")) {
		frontLabels.push("Front");
		backLabels.push("Back");
	}

	frontLabel.innerText = frontLabels.join(" ");
	backLabel.innerText = backLabels.join(" ");

	adjustShowcaseSprites(frontSprite);
	adjustShowcaseSprites(backSprite);
};

const adjustShowcaseSprites = sprite => {
	let src = sprite.getAttribute("data-gifffer");
	if (!src) {
		src = sprite.currentSrc;
	}

	if (src) {
		if (src.includes("/ultra-sun-ultra-moon")) {
			sprite.setAttribute("style", "height: 85%; width: 85%");
			sprite.classList.add("is-square");
		}

		if (
			src.includes("/red-blue/") ||
			src.includes("/yellow/") ||
			src.includes("/ruby-sapphire/") ||
			src.includes("/emerald/") ||
			src.includes("/firered-leafgreen/") ||
			src.includes("/diamond-pearl/") ||
			src.includes("/platinum/") ||
			src.includes("/heartgold-soulsilver/") ||
			src.includes("/black-white")
		) {
			sprite.setAttribute("style", "height: 70%; width: 70%");
			sprite.classList.add("is-square");
		} else if (src.includes("/x-y/")) {
			sprite.style.width = "50%";
			sprite.setAttribute("style", "width: 50%");
		}
	}
};
