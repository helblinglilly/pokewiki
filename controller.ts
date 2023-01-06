import * as ex from "express";
import log from "./log";
import Model from "./model";

class Controller {
	static getIndex = (req: ex.Request, res: ex.Response) => {
		res.render("./index");
	};

	static getSearch = async (req: ex.Request, res: ex.Response) => {
		if (!req.query.term || typeof req.query.term !== "string") {
			res.redirect("/");
			return;
		}

		let showPokemon = req.query.pokemon === "true";
		let showItems = req.query.items === "true";
		let showMoves = req.query.moves === "true";
		let showAbilities = req.query.abilities === "true";

		if (!showPokemon && !showItems && !showMoves && !showAbilities) {
			showPokemon = true;
			showItems = true;
			showMoves = true;
			showAbilities = true;
		}

		const searchResults = await Model.getSearchResults(
			req.query.term,
			showPokemon,
			showItems,
			showMoves,
			showAbilities
		);
		const options = {
			results: searchResults,
			searchTerm: req.query.term,
		};

		res.render("./index", { ...options });
	};

	static getPokemon = async (req: ex.Request, res: ex.Response) => {
		const id = req.url.split("/")[2].split("?")[0];

		let game = "";
		if (typeof req.query.game === "string") {
			game = req.query.game;
		}

		const details = await Model.getPokemonDetail(id, game);
		// console.log(details);
		const options = { ...details };
		res.render("./pokemon", { ...options });
	};
}

export default Controller;
