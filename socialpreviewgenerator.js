const fs = require("fs");
const { convertFile } = require("convert-svg-to-png");

const template = fs.readFileSync("./misc/assets/social_preview.svg", "utf-8");
const outputLocation = "./public/previews";

if (!fs.existsSync(`${outputLocation}`)) fs.mkdirSync(`${outputLocation}`);

if (!fs.existsSync(`${outputLocation}/pokemon`))
	fs.mkdirSync(`${outputLocation}/pokemon`);

if (!fs.existsSync(`${outputLocation}/item`)) fs.mkdirSync(`${outputLocation}/item`);

const pkmn = JSON.parse(fs.readFileSync("./public/pokedata/pokemon.json", "utf-8"));

async function pkmnToPng() {
	for (let i = 0; i < pkmn.length; i++) {
		await convertFile(`${outputLocation}/pokemon/${pkmn[i].id}.svg`, {
			width: 600,
			height: 315,
		});
		fs.rmSync(`${outputLocation}/pokemon/${pkmn[i].id}.svg`);
		console.log(`Converted ${pkmn[i].id} to png`);
	}
}

pkmn.forEach(mon => {
	let entry = template.valueOf();
	entry = entry.replace("SECTION", "Pokémon");
	const englishName = mon.names.filter(a => Object.keys(a).includes("en"))[0];
	entry = entry.replace("ENTRY", `#${mon.id} ${englishName.en}`);

	fs.writeFileSync(`${outputLocation}/pokemon/${mon.id}.svg`, entry, "utf-8");
});

pkmnToPng();

/*
const items = JSON.parse(fs.readFileSync("./public/pokedata/items.json", "utf-8"));
items.forEach(item => {
	let entry = template.valueOf();
	entry = entry.replace("SECTION", "Item");
	const englishName = item.names.filter(a => Object.keys(a).includes("en"))[0];
	entry = entry.replace("ENTRY", `${englishName.en}`);
	fs.writeFileSync(`${outputLocation}/item/${item.id}.svg`, entry, "utf-8");
});
*/
