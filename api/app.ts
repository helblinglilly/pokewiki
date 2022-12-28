import express from "express";
import log from "loglevel";
import Controller from "../controller";
import prefix from "loglevel-plugin-prefix";

prefix.reg(log);

prefix.apply(log, {
	format(level) {
		const date = new Date();
		const day = date.toISOString().split("T")[0];
		const time = date.toISOString().split("T")[1].split("Z")[0];
		return `${day} ${time} ${level}:`;
	},
});

log.setDefaultLevel("WARN");

let port = 0;
if (process.env.NODE_ENV !== "production") {
	port = 3000;
	log.setDefaultLevel("DEBUG");
}

const app = express();

app.set("view engine", "pug");
app.use("/static", express.static(`${__dirname}/../public`));
app.set("views", `${__dirname}/../views`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	log.info(`${req.ip} requesting ${req.url}`);
	next();
});

app.get("/", (req, res, next) => {
	// res.sendStatus(200);
	Controller.getIndex(req, res);
});

app.listen(port, "0.0.0.0", () => {
	log.info(`Listening on http://127.0.0.1:${port}`);
});

export default app;
