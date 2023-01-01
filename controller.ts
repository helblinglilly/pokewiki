import * as ex from "express";
import log from "./log";
import Model from "./model";

class Controller {
	static getIndex = (req: ex.Request, res: ex.Response) => {
		// console.log("Cookies:", req.cookies);
		res.render("./index");
	};

	static getSearch = async (req: ex.Request, res: ex.Response) => {
		if (!req.query.term || typeof req.query.term !== "string") {
			res.redirect("/");
			return;
		}

		const searchResults = await Model.getSearchResults(req.query.term);
		const options = {
			results: searchResults,
			searchTerm: req.query.term,
		};

		res.render("./index", { ...options });
	};
}

export default Controller;
