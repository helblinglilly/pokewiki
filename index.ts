import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import app from "./app";

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

app.listen(port, "0.0.0.0", () => {
	log.info(`Listening on http://127.0.0.1:${port}`);
});
