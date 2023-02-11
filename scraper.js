const axios = require("axios");
const fs = require("fs");

const pokemon = async () => {
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
	fs.writeFileSync("newPokemon.json", JSON.stringify(results), "utf8");
};

const items = async () => {
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
	fs.writeFileSync("newItems1.json", JSON.stringify(results), "utf8");
	fs.writeFileSync("itemFailures.json", JSON.stringify(failures), "utf-8");
};

const findBrokenItems = maxItem => {
	let file = fs.readFileSync("./public/pokedata/items.json", "utf-8");
	file = JSON.parse(file);
	const fails = [];

	let i = 1;
	while (i <= maxItem) {
		const found = file.find(entry => entry.id === i);
		if (!found) fails.push(i);
		i++;
	}

	fs.writeFileSync("brokenItems.json", JSON.stringify(fails), "utf-8");
	return fails;
};

const fixBrokenItems = async arr => {
	const failures = [];
	const results = [];
	for (let i = 0; i < arr.length; i++) {
		let response;
		try {
			response = await axios.get(`https://pokeapi.co/api/v2/item/${arr[i]}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			console.log(arr[i]);
		} catch (err) {
			console.log(arr[i], "failed", err.response.status);
			failures.push(arr[i]);
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
			id: arr[i],
		});
		await new Promise(r => setTimeout(r, 500));
	}
	fs.writeFileSync("fixedItems.json", JSON.stringify(results), "utf8");
	fs.writeFileSync("brokenItems.json", JSON.stringify(failures), "utf-8");
};

const moves = async () => {
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
	fs.writeFileSync("newMoves.json", JSON.stringify(results), "utf8");
};

const fixMoves = () => {
	const moves = JSON.parse(fs.readFileSync("./public/pokedata/moves.json"));
	const fixed = moves.map(a => {
		let sprite =
			"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

		if (a.attack_type === "physical") sprite = "/static/assets/attack-types/physical.png";
		if (a.attack_type === "special") sprite = "/static/assets/attack-types/special.png";
		if (a.attack_type === "status") sprite = "/static/assets/attack-types/status.png";
		return {
			...a,
			link: `/move/${a.id}`,
			attack_type_sprite: sprite,
		};
	});

	fs.writeFileSync("fixedMoves.json", JSON.stringify(fixed), "utf-8");
};

const abilities = async () => {
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
	fs.writeFileSync("newAbilities.json", JSON.stringify(results), "utf8");
};

const addTypeSprites = () => {
	const types = JSON.parse(fs.readFileSync("./public/pokedata/types.json"));
	let moves = JSON.parse(fs.readFileSync("./public/pokedata/moves.json"));

	moves = moves.map(move => {
		let rightType;
		types.forEach(type => {
			if (type.english_id === move.type) {
				rightType = type;
			}
		});
		move.type_sprite = rightType.sprite;
		return move;
	});

	fs.writeFileSync("moves.json", JSON.stringify(moves), "utf8");
};

const generateSocialPreviews = () => {
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

// generateSocialPreviews();
// fixMoves();
// pokemon();
// abilities();
// addTypeSprites();
moves();
