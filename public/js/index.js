document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("extendChangelog").onclick = () => {
		document.getElementById("extendChangelog").classList.toggle("hidden");
		document.getElementById("oldChanges").classList.toggle("hidden");
	};
});
