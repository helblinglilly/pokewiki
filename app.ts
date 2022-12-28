import express from "express";
import log from "loglevel";
import Controller from "./controller";

const app = express();

app.set("view engine", "pug");
app.use("/static", express.static(`${__dirname}/public`));
app.set("views", `${__dirname}/views`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	log.info(`${req.ip} requesting ${req.url}`);
	next();
});

app.get("/", (req, res, next) => {
	Controller.getIndex(req, res);
});

export default app;
