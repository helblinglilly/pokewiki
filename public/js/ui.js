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
		} else {
			current.src = openSprite;
		}

		document.getElementById("navbarBurger").classList.toggle("is-active");
		document.getElementById("navbarMenu").classList.toggle("is-active");
	});

	// Should keep a page history in session storage and use that instead
	// When things we run out of history, hide the button
	const backButton = document.getElementById("backLink");
	backButton.addEventListener("click", () => {
		history.back();
	});
	if (window.location.pathname !== "/") {
		backButton.removeAttribute("hidden");
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
	const host = window.location.protocol + "//" + window.location.host;
	const urlNoParams = document.URL.split(host)[1].split("?")[0];
	const queryParams = document.URL.split(host)[1].split("?")[1];

	if (queryParams) {
		const params = queryParams.split("&");
		const changedParams = [];

		let currentGame;
		let selectedGame;
		params.forEach(entry => {
			let currentSelection;
			let newSelection;

			if (entry.includes("term")) {
				currentSelection = entry.split("=")[1];
				newSelection = document.getElementById("searchBar").value;
			} else if (entry.includes("game")) {
				currentGame = entry.split("=")[1];
				selectedGame = document.getElementById("gameSelector").value;
			} else if (entry.includes("pokemon")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showPokemon").checked;
			} else if (entry.includes("items")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showItems").checked;
			} else if (entry.includes("moves")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showMoves").checked;
			} else if (entry.includes("abilities")) {
				currentSelection = entry.split("=")[1] == "true" ? true : false;
				newSelection = document.getElementById("showAbilities").checked;
			}
			changedParams.push(currentSelection == newSelection);
		});
		if (!changedParams.includes(false)) {
			const search = document.getElementById("search");
			// If all you changed is the Game, then stay on the current page
			search.action = `${urlNoParams}`;
		}
	}

	if (document.getElementById("gameSelector").values !== "all") {
		search.action = `${urlNoParams}`;
	}
	search.submit();
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

	// Only de-select entries if they're not ALL (un)selected
	if (!typeSelections.every(item => item === typeSelections[0])) {
		if (!params.get("pokemon")) {
			document.getElementById("showPokemon").removeAttribute("checked");
		}
		if (!params.get("items")) {
			document.getElementById("showItems").removeAttribute("checked");
		}
		if (!params.get("moves")) {
			document.getElementById("showMoves").removeAttribute("checked");
		}
		if (!params.get("abilities")) {
			document.getElementById("showAbilities").removeAttribute("checked");
		}
	}

	if (params.get("game")) {
		const select = document.getElementById("gameSelector");
		// Select the option from the dropdown with the corresponding value
		for (let i = 0; i < select.options.length; i++) {
			if (select.options[i].value === params.get("game")) {
				select.options[i].selected = true;
			}
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
	}
};
