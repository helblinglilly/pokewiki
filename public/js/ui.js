document.addEventListener("DOMContentLoaded", () => {
	populateSearchFilters();

	document.addEventListener("keydown", (event) => {
		const e = event || window.event;

		if (e.key === "Escape") {
			closeFilter();
		}
	});
});

const openFilter = () => {
	const modal = document.getElementById("filterModal");
	modal.classList.add("is-active");
	modal.classList.remove("hidden");
};

const closeFilter = () => {
	const modal = document.getElementById("filterModal");
	modal.classList.remove("is-active");
	modal.classList.add("hidden");
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
	if (!typeSelections.every((item) => item === typeSelections[0])) {
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
		document
			.getElementById("showPokemon")
			.attributes.removeNamedItem("checked");
	}

	if (params.get("items") == "false") {
		document
			.getElementById("showItems")
			.attributes.removeNamedItem("checked");
	}

	if (params.get("moves") == "false") {
		document
			.getElementById("showMoves")
			.attributes.removeNamedItem("checked");
	}

	if (params.get("abilities") == "false") {
		document
			.getElementById("showAbilities")
			.attributes.removeNamedItem("checked");
	}
};

const toggleVisibility = (sender) => {
	sender.parentElement.childNodes.forEach((child) => {
		if (child.classList.contains("card-content")) {
			if (child.getAttribute("hidden") === null)
				child.setAttribute("hidden", "");
			else child.removeAttribute("hidden");
		}
	});
};
