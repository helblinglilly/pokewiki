import express from "express";
import Controller from "../controller";
import log from "../log";

export let port = 80;
export let host = "https://pokemon.helbling.uk";

if (process.env.NODE_ENV !== "production") {
	port = 3000;
	host = "http://127.0.0.1";
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
	Controller.getIndex(req, res);
});

app.get("/search", (req, res, next) => {
	Controller.getSearch(req, res);
});

app.all("/*", (req, res) => {
	res.render("404");
});

app.listen(port, "0.0.0.0", () => {
	log.info(`Listening on ${host}:${port}`);
});

export default app;
