import * as ex from "express";

class Controller {
	static getIndex = (req: ex.Request, res: ex.Response) => {
		res.render("./index");
	};
}

export default Controller;
