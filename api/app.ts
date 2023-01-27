import express from "express";
import Router from "../router";
import fs from "fs";
import log from "../log";

export let port = 443;
export let host = "https://pokemon.helbling.uk";

// Settings for when app is not deployed
if (process.env.NODE_ENV !== "production") {
	port = 3000;
	host = "http://127.0.0.1";
}
// Settings for when app is deployed in non-production environment
if (process.env.PUBLIC_VERCEL_ENV !== "production") {
	log.setDefaultLevel("DEBUG");
}

const app = express();

app.set("view engine", "pug");

const selfFileExtension = __filename.split(".")[__filename.split(".").length - 1];

if (selfFileExtension === "js" && process.env.NODE_ENV !== "production") {
	app.use("/static", express.static(`${__dirname}/../../public`));
	app.set("views", `${__dirname}/../../views`);
} else {
	app.use("/static", express.static(`${__dirname}/../public`));
	app.set("views", `${__dirname}/../views`);
}

const buildType =
	process.env.NODE_ENV === "production"
		? process.env.PUBLIC_VERCEL_ENV === "production"
			? undefined
			: "Development"
		: "Local";
const buildDate = fs.statSync(`./api/app.${selfFileExtension}`).ctime;

export const appSettings = {
	buildDetails: [buildType, buildDate.toISOString().split("T")[0]].join(" - "),
	buildDate: buildDate,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	log.info(`${req.ip} requesting ${req.url}`);
	next();
});

app.get("/", (req, res, next) => {
	res.render("./index", { ...appSettings });
});

app.all("/", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/search", (req, res, next) => {
	Router.getSearch(req, res);
});
app.all("/search", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/pokemon/*", (req, res, next) => {
	Router.getPokemon(req, res);
});
app.all("/pokemon/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/item/*", (req, res, next) => {
	Router.getItem(req, res);
});
app.all("/item/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/move/*", (req, res, next) => {
	Router.getMove(req, res);
});
app.all("/move/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/ability/*", (req, res, next) => {
	Router.getAbility(req, res);
});
app.all("/ability/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.all("/*", (req, res) => {
	res.status(404).render("error", {
		error: "Page does not exist",
		info: "The page you are trying to access does not exist.",
	});
});

app.listen(port, "0.0.0.0", () => {
	log.info(`Listening on ${host}:${port}`);
});

export default app;
