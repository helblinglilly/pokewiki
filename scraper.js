const axios = require("axios");
const fs = require("fs");

const moves = async () => {
	const maxMoves = 826;

	const results = [];
	for (let i = 0; i < maxMoves; i++) {
		let response;
		try {
			response = await axios.get(`https://pokeapi.co/api/v2/move/${i}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			console.log(i);
		} catch (err) {
			console.log(i, "failed");
			continue;
		}
		let german, english;
		response.data.names.forEach((entry) => {
			if (entry.language.name === "de") {
				german = entry.name;
			}
			if (entry.language.name === "en") {
				english = entry.name;
			}
		});

		const english_id = response.data.name;
		const attack_type = response.data.damage_class.name;
		const type = response.data.type.name;

		results.push({
			id: i,
			german: german,
			english: english,
			english_id: english_id,
			attack_type: attack_type,
			type: type,
		});
		// Wait a bit
		await new Promise((r) => setTimeout(r, 200));
	}
	fs.writeFileSync("moves.json", JSON.stringify(results), "utf8");
};

const addTypeSprites = () => {
	const types = JSON.parse(fs.readFileSync("./public/pokedata/types.json"));
	let moves = JSON.parse(fs.readFileSync("./public/pokedata/moves.json"));

	moves = moves.map((move) => {
		let rightType;
		types.forEach((type) => {
			if (type.english_id === move.type) {
				rightType = type;
			}
		});
		move.type_sprite = rightType.sprite;
		return move;
	});

	fs.writeFileSync("moves.json", JSON.stringify(moves), "utf8");
};

addTypeSprites();

// moves();