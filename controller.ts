import * as ex from "express";

class Controller {
	static getIndex = (req: ex.Request, res: ex.Response) => {
		console.log("Cookies:", req.cookies);
		res.render("./index");
	};
}

export default Controller;
