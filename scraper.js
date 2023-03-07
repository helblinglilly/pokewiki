const axios = require("axios");
const fs = require("fs");

const pokemon = async () => {
	console.log("Scraping data for Pokémon...");
	const startFrom = 1;
	const upTo = 1008;

	const results = [];

	for (let i = startFrom; i <= upTo; i++) {
		let response;
		try {
			response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			console.log(i);
		} catch (err) {
			console.log(i, "failed", err.response.status);
			continue;
		}

		const names = [];
		response.data.names.forEach(entry => {
			const languageCode = entry.language.name;
			const name = entry.name;
			names.push({ [languageCode]: name });
		});

		results.push({
			names: names,
			id: i,
		});
		await new Promise(r => setTimeout(r, 500));
	}
	fs.writeFileSync("./src/data/pokemon.json", JSON.stringify(results), "utf8");
};

const items = async () => {
	console.log("Scraping data for Items...");
	const startFrom = 1;
	const upTo = 2050;

	const results = [];
	const failures = [];
	for (let i = startFrom; i <= upTo; i++) {
		let response;
		try {
			response = await axios.get(`https://pokeapi.co/api/v2/item/${i}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			console.log(i);
		} catch (err) {
			console.log(i, "failed", err.response.status);
			failures.push(i);
			continue;
		}

		const names = [];
		response.data.names.forEach(entry => {
			const languageCode = entry.language.name;
			const name = entry.name;
			names.push({ [languageCode]: name });
		});

		results.push({
			names: names,
			name: response.data.name,
			id: i,
		});
		await new Promise(r => setTimeout(r, 500));
	}
	fs.writeFileSync("./src/data/items.json", JSON.stringify(results), "utf8");
	fs.writeFileSync("itemFailures.json", JSON.stringify(failures), "utf-8");
};

const moves = async () => {
	console.log("Scraping data for Moves...");
	const startFrom = 1;
	const upTo = 918;

	const results = [];

	for (let i = startFrom; i <= upTo; i++) {
		let response;
		try {
			response = await axios.get(`https://pokeapi.co/api/v2/move/${i}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			console.log(i);
		} catch (err) {
			console.log(i, "failed", err.response.status);
			continue;
		}

		const names = [];
		response.data.names.forEach(entry => {
			const languageCode = entry.language.name;
			const name = entry.name;
			names.push({ [languageCode]: name });
		});

		results.push({
			names: names,
			id: i,
			english_id: response.data.name,
			attack_type: response.data.damage_class.name,
			type: response.data.type.name,
		});
		await new Promise(r => setTimeout(r, 500));
	}
	fs.writeFileSync("./src/data/moves.json", JSON.stringify(results), "utf8");
};

const abilities = async () => {
	console.log("Scraping data for Abilities...");
	const startFrom = 10012;
	const upTo = 10060;

	const results = [];

	for (let i = startFrom; i <= upTo; i++) {
		let response;
		try {
			response = await axios.get(`https://pokeapi.co/api/v2/ability/${i}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			console.log(i);
		} catch (err) {
			console.log(i, "failed", err.response.status);
			continue;
		}

		const names = [];
		response.data.names.forEach(entry => {
			const languageCode = entry.language.name;
			const name = entry.name;
			names.push({ [languageCode]: name });
		});

		results.push({
			names: names,
			id: i,
		});
		await new Promise(r => setTimeout(r, 500));
	}
	fs.writeFileSync("./src/data/abilities.json", JSON.stringify(results), "utf8");
};

const types = async () => {
	console.log("Scraping data for Types...");
	const startFrom = 1;
	const upTo = 18;

	const results = [];

	for (let i = startFrom; i <= upTo; i++) {
		let response;
		try {
			response = await axios.get(`https://pokeapi.co/api/v2/type/${i}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			console.log(i);
		} catch (err) {
			console.log(i, "failed", err.response.status);
			continue;
		}

		const mapDamageRelations = damageRelations => {
			const doubleDamageTaken = damageRelations.double_damage_from.map(
				entry => entry.name
			);
			const doubleDamageTo = damageRelations.double_damage_to.map(entry => entry.name);
			const halfDamageFrom = damageRelations.half_damage_from.map(entry => entry.name);
			const halfDamageTo = damageRelations.half_damage_to.map(entry => entry.name);
			const immunities = damageRelations.no_damage_from.map(entry => entry.name);
			const noEffectTo = damageRelations.no_damage_to.map(entry => entry.name);

			return {
				doubleDamageTaken: doubleDamageTaken,
				halfDamageTo: halfDamageTo,

				doubleDamageTo: doubleDamageTo,
				halfDamageFrom: halfDamageFrom,

				immunities: immunities,
				noEffectTo: noEffectTo,
			};
		};

		const pastRelations = [];
		response.data.past_damage_relations.forEach(entry => {
			pastRelations.push({
				generation: entry.generation.name.split("-")[1],
				...mapDamageRelations(entry.damage_relations),
			});
		});

		results.push({
			id: i,
			name: response.data.name,
			sprite: `/static/assets/types/${response.data.name}.webp`,
			generation: response.data.generation.name.split("-")[1],

			currentRelations: { ...mapDamageRelations(response.data.damage_relations) },
			pastRelations: pastRelations,
		});
		await new Promise(r => setTimeout(r, 500));
	}
	fs.writeFileSync("./src/data/types.json", JSON.stringify(results), "utf8");
};

const generateSocialPreviews = () => {
	console.log("Generating social previews. This might take a long time...");
	const template = fs.readFileSync("./misc/assets/social_preview.svg", "utf-8");
	const outputLocation = "./public/previews/";

	const pkmn = JSON.parse(fs.readFileSync("./public/pokedata/pokemon.json", "utf-8"));
	pkmn.forEach(mon => {
		let entry = template.valueOf();
		entry = entry.replace("SECTION", "Pokémon");
		const englishName = mon.names.filter(a => Object.keys(a).includes("en"))[0];
		entry = entry.replace("ENTRY", `#${mon.id} ${englishName.en}`);
		fs.writeFileSync(
			`${outputLocation}pokemon/${mon.id}.svg`,
			JSON.stringify(entry),
			"utf-8"
		);
	});
};

if (process.argv.includes("pokemon")) pokemon();

if (process.argv.includes("ability")) abilities();

if (process.argv.includes("move")) moves();

if (process.argv.includes("item")) items();

if (process.argv.includes("type")) types();

if (process.argv.includes("social")) generateSocialPreviews();

if (process.argv.includes("all")) {
	pokemon();
	abilities();
	moves();
	items();
	types();
}
