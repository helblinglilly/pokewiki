document.addEventListener("DOMContentLoaded", () => {
	const selectedMode = getItem("theme");
	if (selectedMode === "dark-mode") setDarkMode();
	else setLightMode();

	populateSearchFilters();

	if (isMobile) {
		document.querySelectorAll(".collapsible").forEach(item => {
			collapseCard(item);
		});
	}

	document.addEventListener("keydown", event => {
		const e = event || window.event;

		if (e.key === "Escape") {
			closeFilter();
		}
	});

	document.getElementById("themeToggle").addEventListener("click", () => {
		document.body.classList.toggle("dark-mode");
		document.body.classList.toggle("light-mode");
		const newMode = document.body.classList[0];
		setItem("theme", newMode);
	});

	document.getElementById("navbarBurger").addEventListener("click", () => {
		const openSprite = "/static/assets/other/bag_open.png";
		const closeSprite = "/static/assets/other/bag_closed.png";

		const current = document.getElementById("burgerIcon");

		if (current.currentSrc.includes(openSprite)) {
			current.src = closeSprite;
			current.alt =
				"A Pokémon Bagpack in its closed state. Indicating that this Hamburger menu is closed";
		} else {
			current.src = openSprite;
			current.alt =
				"A Pokémon Bagpack in its open state. Indicating that this Hamburger menu is currently open.";
		}

		document.getElementById("navbarBurger").classList.toggle("is-active");
		document.getElementById("navbarMenu").classList.toggle("is-active");
	});

	const primaryLangSelector = document.getElementById("primaryLanguageSelector");
	if (getCookie("primaryLanguage")) {
		primaryLangSelector.value = getCookie("primaryLanguage");
	}
	primaryLangSelector.addEventListener("change", function () {
		setCookie("primaryLanguage", this.value);
	});

	const secondaryLanguageSelector = document.getElementById("secondaryLanguageSelector");
	if (getCookie("secondaryLanguage")) {
		secondaryLanguageSelector.value = getCookie("secondaryLanguage");
	}
	secondaryLanguageSelector.addEventListener("change", function () {
		setCookie("secondaryLanguage", this.value);
	});

	const gameSelector = document.getElementById("gameSelector");
	if (getCookie("game")) {
		gameSelector.value = getCookie("game");
	}
	gameSelector.addEventListener("change", function () {
		setCookie("game", this.value);
	});

	// Should keep a page history in session storage and use that instead
	// When things we run out of history, hide the button
	const backButton = document.getElementById("backLink");
	backButton.addEventListener("click", () => {
		history.back();
	});
	if (window.location.pathname !== "/") {
		backButton.style.display = "inherit";
	}

	checkAllImages();
	addQueryrefToAllLinks();
	makeElementsCollapsible();
});

const setDarkMode = () => {
	document.body.classList.add("dark-mode");
	document.body.classList.remove("light-mode");
	document.body.setAttribute("style", "display: flex;");
};

const setLightMode = () => {
	document.body.classList.add("light-mode");
	document.body.classList.remove("dark-mode");
	document.body.setAttribute("style", "display: flex;");
};

const hideNotice = () => {
	document.getElementById("notice").setAttribute("hidden", "");
};

const submitSearch = () => {
	let returnToSearch = false;

	// Search term
	const existingSearchTerm = getItem("searchTerm");
	const newSearchTerm = document.getElementById("searchBar").value;
	if (newSearchTerm !== existingSearchTerm && newSearchTerm.length > 0) {
		setItem("searchTerm", newSearchTerm);
		returnToSearch = true;
	}

	// Pokemon
	const existingPokemonSelection = getItem("searchPkmn");
	const newPkmnSelection = document.getElementById("showPokemon").checked.toString();
	if (newPkmnSelection !== existingPokemonSelection && newSearchTerm.length > 0) {
		setItem("searchPkmn", newPkmnSelection);
		returnToSearch = true;
	}

	// Items
	const existingItemSelection = getItem("searchItem");
	const newItemSelection = document.getElementById("showItems").checked.toString();
	if (newItemSelection !== existingItemSelection && newSearchTerm.length > 0) {
		setItem("searchItem", newItemSelection);
		returnToSearch = true;
	}

	// Moves
	const existingMoveSelection = getItem("searchMove");
	const newMoveSelection = document.getElementById("showMoves").checked.toString();
	if (newMoveSelection !== existingMoveSelection && newSearchTerm.length > 0) {
		setItem("searchMove", newMoveSelection);
		returnToSearch = true;
	}

	// Abilities
	const existingAbilitySelection = getItem("searchAbility");
	const newAbilitySelection = document.getElementById("showAbilities").checked.toString();
	if (newAbilitySelection !== existingAbilitySelection && newSearchTerm.length > 0) {
		setItem("searchAbility", newAbilitySelection);
		returnToSearch = true;
	}

	const search = document.getElementById("search");

	if (returnToSearch) {
		search.action = "/search";
		search.submit();
	} else {
		// Can reload because other elements are in cookies
		location.reload();
	}
};

const isMobile = new RegExp("Android|Mobile|iPhone|iOS").test(navigator.userAgent);

const openFilter = () => {
	const modal = document.getElementById("filterModal");
	modal.classList.toggle("is-active");
};

const closeFilter = () => {
	const modal = document.getElementById("filterModal");
	modal.classList.remove("is-active");
	modal.classList.add("hidden");
};

const removeVarieties = () => {
	return window.location.search.replace(/\?variety=[0-9]*/g, "");
};

const overrideGameSearch = game => {
	return window.location.search.replace(/game=[^\&]*/g, `game=${game}`);
};

const populateSearchFilters = () => {
	const params = new URL(document.location).searchParams;

	document.getElementById("searchBar").value = params.get("term");

	const typeSelections = [];
	typeSelections.push(params.get("pokemon"));
	typeSelections.push(params.get("items"));
	typeSelections.push(params.get("moves"));
	typeSelections.push(params.get("abilities"));

	setItem("searchTerm", params.get("term"));
	setItem("searchPkmn", "true");
	setItem("searchItem", "true");
	setItem("searchMove", "true");
	setItem("searchAbilities", "true");

	// Only de-select entries if they're not ALL (un)selected
	if (!typeSelections.every(item => item === typeSelections[0])) {
		if (!params.get("pokemon")) {
			document.getElementById("showPokemon").removeAttribute("checked");
			setItem("searchPkmn", "false");
		}
		if (!params.get("items")) {
			document.getElementById("showItems").removeAttribute("checked");
			setItem("searchItem", "false");
		}
		if (!params.get("moves")) {
			document.getElementById("showMoves").removeAttribute("checked");
			setItem("searchMove", "false");
		}
		if (!params.get("abilities")) {
			document.getElementById("showAbilities").removeAttribute("checked");
			setItem("searchAbilities", "false");
		}
	}

	if (params.get("pokemon") == "false") {
		document.getElementById("showPokemon").attributes.removeNamedItem("checked");
	}

	if (params.get("items") == "false") {
		document.getElementById("showItems").attributes.removeNamedItem("checked");
	}

	if (params.get("moves") == "false") {
		document.getElementById("showMoves").attributes.removeNamedItem("checked");
	}

	if (params.get("abilities") == "false") {
		document.getElementById("showAbilities").attributes.removeNamedItem("checked");
	}
};

const makeElementsCollapsible = () => {
	document.querySelectorAll(".collapsible").forEach(el => {
		el.querySelectorAll(".card-header-title").forEach(a => {
			a.classList.add("link");
			a.addEventListener("click", () => {
				collapseCard(el);
			});
		});
	});
};

const collapseCard = card => {
	const cardContent = card.querySelector(".card-content");

	if (cardContent.hasAttribute("hidden")) {
		cardContent.removeAttribute("hidden");
		card.style.backgroundColor = "var(--accent)";
		card.style.height = "100%";
		card.style.boxShadow =
			"0 .5em 1em -.125em rgba(10,10,10,.1),0 0 0 1px rgba(10,10,10,.02)";
	} else {
		cardContent.setAttribute("hidden", "");
		card.querySelector(".card-header-title").style.boxShadow =
			"0 .5em 1em -.125em rgba(10,10,10,.1),0 0 0 1px rgba(10,10,10,.02)";
		card.style.backgroundColor = "transparent";
		card.style.boxShadow = "none";
	}
};

const checkAllImages = () => {
	const placeholder = document.getElementById("placeholder").innerHTML;
	const imgs = document.getElementsByTagName("img");
	for (let i = 0; i < imgs.length; i++) {
		imgs[i].onerror = () => (imgs[i].src = placeholder);
	}
};

const addQueryrefToAllLinks = () => {
	const aLinks = document.getElementsByTagName("a");

	for (let i = 0; i < aLinks.length; i++) {
		if (aLinks[i].classList.contains("keepQuery")) {
			aLinks[i].onclick = () => {
				aLinks[i].href = aLinks[i].href + removeVarieties();
			};
		}
		if (!aLinks[i].classList.contains("shiny")) {
			aLinks[i].onclick = () => {
				aLinks[i].href = aLinks[i].href.replace(/\?shiny=true*/g, "");
			};
		} else if (
			aLinks[i].classList.contains("shiny") &&
			!aLinks[i].href.includes("?shiny=true")
		) {
			aLinks[i].onclick = () => {
				aLinks[i].href = aLinks[i].href += "?shiny=true";
			};
		}
	}
};
