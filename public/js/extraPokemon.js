document.addEventListener("DOMContentLoaded", () => {
	try {
		document.getElementById("loadMorePokemon").addEventListener("click", e => {
			const all = document.getElementsByClassName("extraPokemon");
			extendFurther(all, e.target);
		});
	} catch {}

	try {
		document.getElementById("loadMoreItems").addEventListener("click", e => {
			const all = document.getElementsByClassName("extraItems");
			extendFurther(all, e.target);
		});
	} catch {}

	try {
		document.getElementById("loadMoreMoves").addEventListener("click", e => {
			const all = document.getElementsByClassName("extraMoves");
			extendFurther(all, e.target);
		});
	} catch {}
	try {
		document.getElementById("loadMoreAbilities").addEventListener("click", e => {
			const all = document.getElementsByClassName("extraAbilities");
			extendFurther(all, e.target);
		});
	} catch {}
});

const extendFurther = (all, button) => {
	const hidden = [];
	for (let i = 0; i < all.length; i++) {
		if (all[i].style.display === "none") hidden.push(all[i]);
	}

	const hideButton = () => {
		button.style.display = "none";
	};

	hidden.forEach((a, i) => {
		if (i < 20) {
			a.style.display = "inherit";
			if (i === hidden.length - 1) hideButton();
		}
	});

	if (hidden.length === 0) hideButton();
};
