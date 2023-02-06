const fs = require("fs");

const template = fs.readFileSync("./public/previews/generic.svg", "utf-8");
const outputLocation = "./public/previews";

if (!fs.existsSync(`${outputLocation}`)) fs.mkdirSync(`${outputLocation}`);

if (!fs.existsSync(`${outputLocation}/pokemon`))
	fs.mkdirSync(`${outputLocation}/pokemon`);

if (!fs.existsSync(`${outputLocation}/item`)) fs.mkdirSync(`${outputLocation}/item`);

const pkmn = JSON.parse(fs.readFileSync("./public/pokedata/pokemon.json", "utf-8"));
pkmn.forEach(mon => {
	let entry = template.valueOf();
	entry = entry.replace("SECTION", "Pokémon");
	const englishName = mon.names.filter(a => Object.keys(a).includes("en"))[0];
	entry = entry.replace("ENTRY", `#${mon.id} ${englishName.en}`);
	fs.writeFileSync(`${outputLocation}/pokemon/${mon.id}.svg`, entry, "utf-8");
});

const items = JSON.parse(fs.readFileSync("./public/pokedata/items.json", "utf-8"));
items.forEach(item => {
	let entry = template.valueOf();
	entry = entry.replace("SECTION", "Pokémon");
	const englishName = item.names.filter(a => Object.keys(a).includes("en"))[0];
	entry = entry.replace("ENTRY", `${englishName.en}`);
	fs.writeFileSync(`${outputLocation}/item/${item.id}.svg`, entry, "utf-8");
});
