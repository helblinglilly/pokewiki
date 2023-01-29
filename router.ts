import * as ex from "express";
import log from "./log";
import Controller from "./controller";
import { ErrorMessage } from "./types";
import { appSettings, handleServerError } from "./api/app";

class Router {
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

		const controller = new Controller(
			appSettings.primaryLanguage,
			appSettings.secondaryLanguage
		);
		const searchResults = await controller.getSearchResults(
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

		res.render("./searchResults", { ...options, ...appSettings });
	};

	static getPokemon = async (req: ex.Request, res: ex.Response) => {
		let id = -1;
		try {
			id = parseInt(req.url.split("/")[2].split("?")[0]);
			if (!id) throw new Error("No Pokémon ID");
			if (id < 1 || id > appSettings.highestPokedexId)
				throw new Error("Invalid Pokémon ID");
		} catch {
			const err: ErrorMessage = {
				error: "Invalid Pokémon ID",
				info: `The Pokémon with the given National Pokédex ID you requested (${
					id ? id : "None"
				}) does not exist. Valid IDs range from 1 to ${appSettings.highestPokedexId}`,
			};
			res.status(400).render("./error", { ...err, ...appSettings });
			return;
		}

		let game = "";
		if (typeof req.query.game === "string") game = req.query.game;

		let variety = 0;
		if (typeof req.query.variety === "string") {
			try {
				variety = parseInt(req.query.variety);
			} catch {
				const err: ErrorMessage = {
					error: "Invalid query type",
					info: `You requested a variety of a Pokémon that does not exist. Varieties are not sequential, so please don't modify them as only the UI will lead you to a predictable path.`,
				};
				res.status(400).render("./error", { ...err, ...appSettings });
				return;
			}
		}
		try {
			const controller = new Controller(
				appSettings.primaryLanguage,
				appSettings.secondaryLanguage
			);
			const details = await controller.getPokemonDetail(id, variety, game);
			const options = { ...details };
			res.render("./pokemon", { ...options, ...appSettings });
		} catch (err: any) {
			handleServerError(req, { error: "Internal Server Error", info: err }, res);
		}
	};

	static getMove = async (req: ex.Request, res: ex.Response) => {
		const err: ErrorMessage = {
			error: "Not implemented",
			info: `The page you are trying to view has not been built yet.`,
		};
		res.status(501).render("./error", { ...err, ...appSettings });
	};

	static getItem = async (req: ex.Request, res: ex.Response) => {
		let id = -1;
		try {
			id = parseInt(req.url.split("/")[2].split("?")[0]);
			if (!id) throw new Error("No Item ID");
			if (id < 1 || id > appSettings.highestItemId) throw new Error("Invalid Item ID");
		} catch {
			const err: ErrorMessage = {
				error: "Invalid Item ID",
				info: `The Item with the given ID you requested (${
					id ? id : "None"
				}) does not exist. Valid IDs range from 1 to ${appSettings.highestItemId}`,
			};
			res.status(400).render("./error", { ...err, ...appSettings });
			return;
		}

		let game = "";
		if (typeof req.query.game === "string") game = req.query.game;

		try {
			const controller = new Controller(
				appSettings.primaryLanguage,
				appSettings.secondaryLanguage
			);
			const details = await controller.getItem(id, game);
			const options = { ...details };
			res.render("./item", { ...options, ...appSettings });
		} catch (err: any) {
			handleServerError(req, { error: "Internal Server Error", info: err }, res);
		}
	};

	static getAbility = async (req: ex.Request, res: ex.Response) => {
		const err: ErrorMessage = {
			error: "Not implemented",
			info: `The page you are trying to view has not been built yet.`,
		};
		res.status(501).render("./error", { ...err, ...appSettings });
	};
}

export default Router;
