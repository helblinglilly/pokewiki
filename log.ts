import log from "loglevel";
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

export default log;
