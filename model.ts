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

interface Cache {
	pokemon: {
		id: number;
		data: APIResponsePokemon;
	}[];
	pokemon_species: {
		id: number;
		data: APIResponseSpecies;
	}[];
	pokemon_forms: {
		id: number;
		data: APIResponseForm;
	}[];
	evolution_chain: {
		id: number;
		data: APIResponseEvolution;
	}[];
	abilities: {
		id: number;
		data: APIResponseAbility;
	}[];
}

const cache: Cache = {
	pokemon: [],
	pokemon_species: [],
	pokemon_forms: [],
	evolution_chain: [],
	abilities: [],
};

export class Data {
	searchResults = 10;
	cacheDir = "./cache";
	api = "https://pokeapi.co/api/v2";
	notFoundSprite =
		"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

	getPokemon = async (id: number): Promise<APIResponsePokemon> => {
		const cachedData = cache.pokemon.find(a => a.id === id);
		if (cachedData) return cachedData.data;

		const data = await axios.get(`${this.api}/pokemon/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.pokemon.push({
			id: id,
			data: data.data,
		});

		return data.data;
	};

	getPokemonSpecies = async (id: number): Promise<APIResponseSpecies> => {
		const cachedData = cache.pokemon_species.find(a => a.id === id);
		if (cachedData) return cachedData.data;

		const data = await axios.get(`${this.api}/pokemon-species/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.pokemon_species.push({
			id: id,
			data: data.data,
		});

		return data.data;
	};

	getPokemonForm = async (id: number): Promise<APIResponseForm> => {
		const cachedData = cache.pokemon_forms.find(a => a.id === id);
		if (cachedData) return cachedData.data;

		const data = await axios.get(`${this.api}/pokemon-form/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.pokemon_forms.push({
			id: id,
			data: data.data,
		});

		return data.data;
	};

	getEvolutionChain = async (id: number): Promise<APIResponseEvolution> => {
		const cachedData = cache.evolution_chain.find(a => a.id === id);
		if (cachedData) return cachedData.data;

		const data = await axios.get(`${this.api}/evolution-chain/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.evolution_chain.push({
			id: id,
			data: data.data,
		});

		return data.data;
	};

	getAbility = async (id: number): Promise<APIResponseAbility> => {
		const cachedData = cache.abilities.find(a => a.id === id);
		if (cachedData) return cachedData.data;

		const data = await axios.get(`${this.api}/ability/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.abilities.push({
			id: id,
			data: data.data,
		});

		return data.data;
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

		const promises: Array<
			| Promise<APIResponseEvolution>
			| Promise<APIResponseAbility>
			| Promise<APIResponseForm>
			| Promise<APIResponsePokemon>
		> = [];

		const evolutionURL = speciesData.evolution_chain.url.split("/");
		const evolutionId = evolutionURL[evolutionURL.length - 2];
		promises.push(this.getEvolutionChain(parseInt(evolutionId)));

		let abilityCount = 0;
		pokemonData.abilities.forEach(ability => {
			const abilityURL = ability.ability.url.split("/");
			const abilityId = abilityURL[abilityURL.length - 2];
			promises.push(this.getAbility(parseInt(abilityId)));
			abilityCount++;
		});

		let formCount = 0;
		pokemonData.forms.forEach(form => {
			const formURL = form.url.split("/");
			const formId = formURL[formURL.length - 2];
			promises.push(this.getPokemonForm(parseInt(formId)));
			formCount++;
		});

		let varietyCount = 0;
		speciesData.varieties.forEach(variety => {
			const varietyURL = variety.pokemon.url.split("/");
			const varietyId = varietyURL[varietyURL.length - 2];
			promises.push(this.getPokemon(parseInt(varietyId)));
			varietyCount++;
		});

		const results = await Promise.all(promises);
		const evolution = results.splice(0, 1)[0] as APIResponseEvolution;
		const abilities = results.splice(0, abilityCount) as APIResponseAbility[];
		const forms = results.splice(0, formCount) as APIResponseForm[];
		const varieties = results.splice(0, varietyCount) as APIResponsePokemon[];

		return {
			pokemon: pokemonData,
			species: speciesData,
			evolution: evolution,
			abilities: abilities,
			forms: forms,
			varieties: varieties,
		};
	};
}
