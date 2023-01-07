import * as ex from "express";
import log from "./log";
import Model from "./model";
import { ErrorMessage } from "./types";

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
		let id = -1;
		try {
			id = parseInt(req.url.split("/")[2].split("?")[0]);
			if (!id) throw new Error("No Pokémon ID");
			if (id < 1 || id > 905) throw new Error("Invalid Pokémon ID");
		} catch {
			const err: ErrorMessage = {
				error: "Invalid Pokémon ID",
				info: `The Pokémon with the given National Pokédex ID you requested (${
					id ? id : "None"
				}) does not exist. Valid IDs range from 1 to 905`,
			};
			res.status(400).render("./error", { ...err });
			return;
		}

		let game = "";
		if (typeof req.query.game === "string") {
			if (req.query.game !== "all") game = req.query.game;
		}

		const details = await Model.getPokemonDetail(id, game);
		const options = { ...details };
		res.render("./pokemon", { ...options });
	};

	static getMove = async (req: ex.Request, res: ex.Response) => {
		const err: ErrorMessage = {
			error: "Not implemented",
			info: `The page you are trying to view has not been built yet.`,
		};
		res.status(501).render("./error", { ...err });
	};

	static getItem = async (req: ex.Request, res: ex.Response) => {
		const err: ErrorMessage = {
			error: "Not implemented",
			info: `The page you are trying to view has not been built yet.`,
		};
		res.status(501).render("./error", { ...err });
	};

	static getAbility = async (req: ex.Request, res: ex.Response) => {
		const err: ErrorMessage = {
			error: "Not implemented",
			info: `The page you are trying to view has not been built yet.`,
		};
		res.status(501).render("./error", { ...err });
	};
}

export default Controller;
