import fs from "fs/promises";
import axios from "axios";
import {
	APIResponseAbility,
	APIResponseEvolution,
	APIResponseForm,
	APIResponsePokemon,
	APIResponseSpecies,
	GenericEntry,
	MoveEntry,
	PokemonName,
} from "./types";
import Pokemon from "./public/pokedata/pokemon.json";
import Items from "./public/pokedata/items.json";
import Moves from "./public/pokedata/moves.json";
import Abilities from "./public/pokedata/abilities.json";
import log from "./log";

export class Data {
	searchResults = 10;
	cacheDir = "./cache";
	api = "https://pokeapi.co/api/v2";
	notFoundSprite =
		"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

	constructor() {
		fs.access(this.cacheDir).catch(() => {
			fs.mkdir(this.cacheDir).then(() => {
				const dirs = [];
				dirs.push(fs.mkdir(`${this.cacheDir}/pokemon`));
				dirs.push(fs.mkdir(`${this.cacheDir}/pokemon-species`));
				dirs.push(fs.mkdir(`${this.cacheDir}/pokemon-form`));
				dirs.push(fs.mkdir(`${this.cacheDir}/evolution-chain`));
				dirs.push(fs.mkdir(`${this.cacheDir}/moves`));
				dirs.push(fs.mkdir(`${this.cacheDir}/abilities`));

				Promise.all(dirs);
			});
		});
	}

	getPokemon = async (id: number): Promise<APIResponsePokemon> => {
		try {
			await fs.access(`${this.cacheDir}/pokemon/${id}.json`);
			const data = await fs.readFile(`${this.cacheDir}/pokemon/${id}.json`, "utf-8");
			return JSON.parse(data) as APIResponsePokemon;
		} catch {
			const data = await axios.get(`${this.api}/pokemon/${id}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			fs.writeFile(
				`${this.cacheDir}/pokemon/${id}.json`,
				JSON.stringify(data.data),
				"utf-8"
			);
			return data.data;
		}
	};

	getPokemonSpecies = async (id: number): Promise<APIResponseSpecies> => {
		try {
			await fs.access(`${this.cacheDir}/pokemon-species/${id}.json`);
			const data = await fs.readFile(
				`${this.cacheDir}/pokemon-species/${id}.json`,
				"utf-8"
			);
			return JSON.parse(data) as APIResponseSpecies;
		} catch {
			const data = await axios.get(`${this.api}/pokemon-species/${id}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			fs.writeFile(
				`${this.cacheDir}/pokemon-species/${id}.json`,
				JSON.stringify(data.data),
				"utf-8"
			);

			return data.data;
		}
	};

	getPokemonForm = async (id: number): Promise<APIResponseForm> => {
		try {
			await fs.access(`${this.cacheDir}/pokemon-form/${id}.json`);
			const data = await fs.readFile(`${this.cacheDir}/pokemon-form/${id}.json`, "utf-8");
			return JSON.parse(data) as APIResponseForm;
		} catch {
			const data = await axios.get(`${this.api}/pokemon-form/${id}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			fs.writeFile(
				`${this.cacheDir}/pokemon-form/${id}.json`,
				JSON.stringify(data.data),
				"utf-8"
			);

			return data.data;
		}
	};

	getEvolutionChain = async (id: number): Promise<APIResponseEvolution> => {
		try {
			await fs.access(`${this.cacheDir}/evolution-chain/${id}.json`);
			const data = await fs.readFile(
				`${this.cacheDir}/evolution-chain/${id}.json`,
				"utf-8"
			);
			return JSON.parse(data) as APIResponseEvolution;
		} catch {
			const data = await axios.get(`${this.api}/evolution-chain/${id}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			fs.writeFile(
				`${this.cacheDir}/evolution-chain/${id}.json`,
				JSON.stringify(data.data),
				"utf-8"
			);

			return data.data;
		}
	};

	getAbility = async (id: number): Promise<APIResponseAbility> => {
		try {
			await fs.access(`${this.cacheDir}/abilities/${id}.json`);
			const data = await fs.readFile(`${this.cacheDir}/abilities/${id}.json`, "utf-8");
			return JSON.parse(data) as APIResponseAbility;
		} catch {
			const data = await axios.get(`${this.api}/ability/${id}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			});
			fs.writeFile(
				`${this.cacheDir}/abilities/${id}.json`,
				JSON.stringify(data.data),
				"utf-8"
			);

			return data.data;
		}
	};

	attackSprite = (name: "physical" | "special" | "status"): string => {
		if (name === "physical") return "/public/assets/attack-types/physical.png";
		if (name === "special") return "/public/assets/attack-types/special.png";
		if (name === "status") return "/public/assets/attack-types/status.png";
		return this.notFoundSprite;
	};

	typeSprite = (name: string): string => {
		name = name.toLowerCase();
		if (name === "normal") return "/static/assets/attack-types/normal.webp";
		else if (name === "kampf" || name === "fight")
			return "/static/assets/attack-types/fight.webp";
		else if (name === "flug" || name === "flying")
			return "/static/assets/attack-types/flying.webp";
		else if (name === "webpt" || name === "poison")
			return "/static/assets/attack-types/poison.webp";
		else if (name === "boden" || name === "ground")
			return "/static/assets/attack-types/ground.webp";
		else if (name === "gestein" || name === "rock")
			return "/static/assets/attack-types/rock.webp";
		else if (name === "käfer" || name === "bug")
			return "/static/assets/attack-types/bug.webp";
		else if (name === "geist" || name === "ghost")
			return "/static/assets/attack-types/ghost.webp";
		else if (name === "stahl" || name === "steel")
			return "/static/assets/attack-types/steel.webp";
		else if (name === "feuer" || name === "fire")
			return "/static/assets/attack-types/fire.webp";
		else if (name === "wasser" || name === "water")
			return "/static/assets/attack-types/water.webp";
		else if (name === "pflanze" || name === "grass")
			return "/static/assets/attack-types/grass.webp";
		else if (name === "elektro" || name === "electric")
			return "/static/assets/attack-types/electric.webp";
		else if (name === "psycho" || name === "psychic")
			return "/static/assets/attack-types/psychic.webp";
		else if (name === "eis" || name === "ice")
			return "/static/assets/attack-types/ice.webp";
		else if (name === "drache" || name === "dragon")
			return "/static/assets/attack-types/dragon.webp";
		else if (name === "unlicht" || name === "dark")
			return "/static/assets/attack-types/dark.webp";
		else if (name === "fee" || name === "fairy")
			return "/static/assets/attack-types/fairy.webp";
		return this.notFoundSprite;
	};

	findPokemonNameFromId = (id: number): PokemonName | undefined => {
		const result = Pokemon.find(a => a.id === id);
		if (!result) return undefined;

		return {
			...result,
			link: `/pokemon/${result.id}`,
			sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${result.id}.png`,
		};
	};

	findPokemonFromName = (name: string): PokemonName[] => {
		name = name.toLocaleLowerCase();

		const regex = new RegExp(
			`${name
				.split("")
				.map(char => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const results: PokemonName[] = [];
		Pokemon.forEach(a => {
			if (results.length === this.searchResults - 1) {
				return;
			}
			let german = a.german.toLocaleLowerCase();
			german.replace("ä", "a");
			german.replace("ü", "u");
			german.replace("ö", "o");

			const entry = {
				...a,
				link: `/pokemon/${a.id}`,
				sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${a.id}.png`,
			};

			if (regex.test(german)) results.push(entry);
			else if (regex.test(a.english)) results.push(entry);
			else if (a.id.toString() === name) results.push(entry);
		});
		return results;
	};

	findItemFromName = (name: string): GenericEntry[] => {
		name = name.toLocaleLowerCase();

		const regex = new RegExp(
			`${name
				.split("")
				.map(char => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		log.debug(regex);

		const results: GenericEntry[] = [];
		Items.forEach(a => {
			if (results.length === this.searchResults - 1) {
				return;
			}

			let german = a.german.toLocaleLowerCase();
			german.replace("ä", "a");
			german.replace("ü", "u");
			german.replace("ö", "o");

			const entry = {
				...a,
				link: `/item/${a.id}`,
				sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${a.english_id}.png`,
			};

			if (regex.test(german)) results.push(entry);
			else if (regex.test(a.english)) results.push(entry);
		});

		return results;
	};

	findAbilityFromName = (name: string): GenericEntry[] => {
		name = name.toLocaleLowerCase();

		const regex = new RegExp(
			`${name
				.split("")
				.map(char => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const results: GenericEntry[] = [];
		Abilities.forEach(a => {
			if (results.length === this.searchResults - 1) {
				return;
			}

			let german = a.german.toLocaleLowerCase();
			german.replace("ä", "a");
			german.replace("ü", "u");
			german.replace("ö", "o");

			const entry = {
				...a,
				link: `/ability/${a.id}`,
				sprite: ``,
			};
			if (regex.test(german)) results.push(entry);
			else if (regex.test(a.english)) results.push(entry);
		});

		return results;
	};

	findMoveFromName = (name: string): MoveEntry[] => {
		name = name.toLocaleLowerCase();

		const regex = new RegExp(
			`${name
				.split("")
				.map(char => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const results: MoveEntry[] = [];
		Moves.forEach(a => {
			if (results.length === this.searchResults - 1) {
				return;
			}

			let german = a.german.toLocaleLowerCase();
			german.replace("ä", "a");
			german.replace("ü", "u");
			german.replace("ö", "o");

			let attackTypeSprite = "";
			if (a.attack_type === "physical")
				attackTypeSprite = "/static/assets/attack-types/physical.png";
			else if (a.attack_type === "special")
				attackTypeSprite = "/static/assets/attack-types/special.png";
			else if (a.attack_type === "status")
				attackTypeSprite = "/static/assets/attack-types/status.png";

			const move: MoveEntry = {
				...a,
				link: `/move/${a.id}`,
				sprite: this.typeSprite(a.type),
				attack_type_sprite: attackTypeSprite,
			};

			if (regex.test(german)) results.push(move);
			else if (regex.test(a.english)) results.push(move);
		});

		return results;
	};

	pokemonData = async (id: number, varietyId?: number) => {
		const [pokemonData, speciesData] = await Promise.all([
			this.getPokemon(varietyId ? varietyId : id),
			this.getPokemonSpecies(id),
		]);

		const promises = [];

		const evolutionURL = speciesData.evolution_chain.url.split("/");
		const evolutionId = evolutionURL[evolutionURL.length - 2];
		promises.push(this.getEvolutionChain(parseInt(evolutionId)));

		pokemonData.abilities.forEach(async ability => {
			const abilityURL = ability.ability.url.split("/");
			const abilityId = abilityURL[abilityURL.length - 2];
			promises.push(this.getAbility(parseInt(abilityId)));
		});

		const [evolutionData, ...abilityData] = await Promise.all(promises);

		return {
			pokemon: pokemonData,
			species: speciesData,
			evolution: evolutionData,
			abilities: abilityData,
		};
	};
}
