import * as ex from "express";
import log from "./log";
import Controller from "./controller";
import { ErrorMessage } from "./types";
import app, { appSettings, handleServerError } from "../api/app";

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
			appSettings.primaryLanguageCode,
			appSettings.secondaryLanguageCode
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
				appSettings.primaryLanguageCode,
				appSettings.secondaryLanguageCode
			);
			const details = await controller.getPokemonDetail(id, variety, game);
			const options = { ...details };
			res.render("./pokemon", { ...options, ...appSettings });
		} catch (err: any) {
			handleServerError(req, { error: "Internal Server Error", info: err }, res);
		}
	};

	static getMove = async (req: ex.Request, res: ex.Response) => {
		let id = -1;
		try {
			id = parseInt(req.url.split("/")[2].split("?")[0]);
			if (!id) throw new Error("No Move Id");
			if (id < 1 || id > appSettings.highestMoveId) throw new Error("Invalid Move Id");
		} catch {
			const err: ErrorMessage = {
				error: "Invalid Move ID",
				info: `The Move with the given ID you requested (${
					id ? id : "None"
				}) does not exist. Valid IDs range from 1 to ${appSettings.highestMoveId}`,
			};
			res.status(400).render("./error", { ...err, ...appSettings });
			return;
		}

		let game = "";
		if (typeof req.query.game === "string") game = req.query.game;

		try {
			const controller = new Controller(
				appSettings.primaryLanguageCode,
				appSettings.secondaryLanguageCode
			);
			const details = await controller.getMove(id, game);
			const options = { ...details };
			res.render("./move", { ...options, ...appSettings });
		} catch (err: any) {
			handleServerError(req, { error: "Internal Server Error", info: err }, res);
		}
	};

	static getItem = async (req: ex.Request, res: ex.Response) => {
		const start = new Date();
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
				appSettings.primaryLanguageCode,
				appSettings.secondaryLanguageCode
			);
			const details = await controller.getItem(id, game);
			const options = { ...details };
			log.debug(
				`Finished getting item ${id} in ${new Date().valueOf() - start.valueOf()}ms`
			);
			res.render("./item", { ...options, ...appSettings });
		} catch (err: any) {
			handleServerError(req, { error: "Internal Server Error", info: err }, res);
		}
	};

	static getAbility = async (req: ex.Request, res: ex.Response) => {
		let id = -1;
		try {
			id = parseInt(req.url.split("/")[2].split("?")[0]);
			if (!id) throw new Error("No Ability ID");
			if (
				id < 1 ||
				id > appSettings.extraAbilityRange[1] ||
				(id > appSettings.highestAbilityId && id < appSettings.extraAbilityRange[0])
			) {
				throw new Error("Invalid Ability ID");
			}
		} catch {
			const err: ErrorMessage = {
				error: "Invalid Ability ID",
				info: `The Ability with the ID you requested does not exist (${
					id ? id : "None"
				}). Valid IDs range from 1 to ${appSettings.highestPokedexId}`,
			};
			res.status(400).render("./error", { ...err, ...appSettings });
			return;
		}

		let game = "";
		if (typeof req.query.game === "string") game = req.query.game;

		try {
			const controller = new Controller(
				appSettings.primaryLanguageCode,
				appSettings.secondaryLanguageCode
			);
			const details = await controller.getAbility(id, game);
			const options = { ...details };
			res.render("./ability", { ...options, ...appSettings });
		} catch (err: any) {
			handleServerError(req, { error: "Internal Server Error", info: err }, res);
		}
	};
}

export default Router;
