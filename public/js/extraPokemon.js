document.addEventListener("DOMContentLoaded", () => {
	try {
		document.getElementById("loadMorePokemon").addEventListener("click", () => {
			const all = document.getElementsByClassName("extraPokemon");
			const hidden = [];
			for (let i = 0; i < all.length; i++) {
				if (all[i].style.display === "none") hidden.push(all[i]);
			}

			const hideButton = () => {
				document.getElementById("loadMorePokemon").style.display = "none";
			};

			hidden.forEach((a, i) => {
				if (i < 20) {
					a.style.display = "inherit";
				}
				if (i === hidden.length - 1) hideButton();
			});

			if (hidden.length === 0) hideButton();
		});
	} catch {}
});
