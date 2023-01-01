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

		const showPokemon = req.query.pokemon === "true";
		const showItems = req.query.items === "true";
		const showMoves = req.query.moves === "moves";
		const showAbilities = req.query.abilities === "true";

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
}

export default Controller;
