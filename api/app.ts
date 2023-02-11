import express from "express";
import Router from "../src/router";
import { ErrorMessage } from "../src/types";
import fs from "fs";
import log from "../src/log";

export let port = 443;
export let host = "https://pokemon.helbling.uk";

// Settings for when app is not deployed
if (process.env.NODE_ENV !== "production") {
	port = 3000;
	host = "http://127.0.0.1";
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
		? process.env.VERCEL_ENV === "production"
			? "Build"
			: "Development"
		: "Local";

const buildInfo =
	buildType === "Local"
		? fs.statSync(`./api/app.${selfFileExtension}`).ctime.toISOString().split("T")[0]
		: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 6);

if (buildType === "Build") {
	log.setDefaultLevel("INFO");
} else {
	log.setDefaultLevel("DEBUG");
}

export const appSettings = {
	primaryLanguageCode: "en",
	secondaryLanguageCode: "de",
	maxSearchResults: 10,
	buildDetails: [buildType, buildInfo].join(" - "),
	buildDate: buildInfo,
	highestPokedexId: 1008,
	highestItemId: 1658,
	highestMoveId: 918,
	highestAbilityId: 298,
	extraAbilityRange: [10001, 10060],
	placeholderImage:
		"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	log.info(`${req.ip} requesting ${req.url}`);
	next();
});

export const handleServerError = (req: any, details: ErrorMessage, res: any) => {
	log.error(details.error, details.info, req);
	res.status(500).render("./error", {
		error: details.error,
		info: "Details about your request have been logged.",
		...appSettings,
	});
};

app.get("/", (req, res, next) => {
	res.render("./index", { ...appSettings });
});

app.options("/*", (req, res) => {
	const allowedURLs = [
		"https://pokemon.helbling.uk",
		"https://www.pokemon.helbling.uk",
		"https://dev.pokemon.helbling.uk",
		"https://www.dev.pokemon.helbling.uk",
	];

	if (allowedURLs.includes(req.headers.origin ? req.headers.origin : "no")) {
		res.set("Access-Control-Allow-Origin", req.headers.origin);
		res.set("Vary", "Origin");
		log.debug("Allowed CORS request from", req.headers.origin);
		res.sendStatus(200);
		return;
	}
	log.debug("Blocked CORS request from", req.headers.origin);
	res.sendStatus(401);
});

app.all("/", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/search", (req, res, next) => {
	try {
		Router.getSearch(req, res);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});
app.all("/search", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/pokemon/*", (req, res, next) => {
	try {
		Router.getPokemon(req, res);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});

app.all("/pokemon/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/item/*", (req, res, next) => {
	try {
		Router.getItem(req, res);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});
app.all("/item/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/move/*", (req, res, next) => {
	try {
		Router.getMove(req, res);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
});
app.all("/move/*", (req, res) => {
	res.status(405).render("error", {
		error: "Method not allowed",
		info: `${req.method} is not supported on this endpoint`,
	});
});

app.get("/ability/*", (req, res, next) => {
	try {
		Router.getAbility(req, res);
	} catch (err: any) {
		handleServerError(req, { error: "Internal Server Error", info: err }, res);
	}
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
