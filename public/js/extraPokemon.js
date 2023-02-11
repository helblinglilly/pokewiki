document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("loadMorePokemon").addEventListener("click", () => {
		const all = document.getElementsByClassName("extraPokemon");
		const hidden = [];
		for (let i = 0; i < all.length; i++) {
			if (all[i].style.display === "none") hidden.push(all[i]);
		}
		hidden.forEach((a, i) => {
			if (i < 20) {
				a.style.display = "inherit";
			}
		});
	});
});
