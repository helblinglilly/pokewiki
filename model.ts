import axios from "axios";
import {
	AbilityResult,
	APIResponseAbility,
	APIResponseEvolution,
	APIResponseForm,
	APIResponseItem,
	APIResponseMachine,
	APIResponseMove,
	APIResponsePokemon,
	APIResponseSpecies,
	GenericResult,
	ItemResult,
	MoveEntry,
	PokemonName,
} from "./types";
import Pokemon from "./public/pokedata/pokemon.json";
import Items from "./public/pokedata/items.json";
import Moves from "./public/pokedata/moves.json";
import Abilities from "./public/pokedata/abilities.json";
import log from "./log";
import Utils from "./utils";

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
	items: {
		id: number;
		data: APIResponseItem;
	}[];
	machines: {
		id: number;
		data: APIResponseMachine;
	}[];
	moves: {
		id: number;
		data: APIResponseMove;
	}[];
}

const cache: Cache = {
	pokemon: [],
	pokemon_species: [],
	pokemon_forms: [],
	evolution_chain: [],
	abilities: [],
	items: [],
	machines: [],
	moves: [],
};

export class Data {
	searchResults = 10;
	cacheDir = "./cache";
	api = "https://pokeapi.co/api/v2";
	primaryLangKey: string;
	secondaryLangKey: string;

	constructor(primLang: string, secLang?: string) {
		this.primaryLangKey = primLang;
		this.secondaryLangKey = secLang ? secLang : primLang;
	}

	getPokemon = async (id: number): Promise<APIResponsePokemon> => {
		const cachedData = cache.pokemon.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - Pokemon ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/pokemon/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.pokemon.push({
			id: id,
			data: data.data,
		});

		log.info(`Cache - MISS - Pokemon ${id}`);

		return data.data;
	};

	getPokemonSpecies = async (id: number): Promise<APIResponseSpecies> => {
		const cachedData = cache.pokemon_species.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - Pokemon Species ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/pokemon-species/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.pokemon_species.push({
			id: id,
			data: data.data,
		});

		log.info(`Cache - MISS - Pokemon Species ${id}`);
		return data.data;
	};

	getPokemonForm = async (id: number): Promise<APIResponseForm> => {
		const cachedData = cache.pokemon_forms.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - Pokemon Form ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/pokemon-form/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.pokemon_forms.push({
			id: id,
			data: data.data,
		});

		log.info(`Cache - MISS - Pokemon Form ${id}`);
		return data.data;
	};

	getEvolutionChain = async (id: number): Promise<APIResponseEvolution> => {
		const cachedData = cache.evolution_chain.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - Evolution Chain ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/evolution-chain/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.evolution_chain.push({
			id: id,
			data: data.data,
		});

		log.info(`Cache - MISS - Evolution Chain ${id}`);
		return data.data;
	};

	getAbility = async (id: number): Promise<APIResponseAbility> => {
		const cachedData = cache.abilities.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - Ability ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/ability/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.abilities.push({
			id: id,
			data: data.data,
		});
		log.info(`Cache - MISS - Ability ${id}`);
		return data.data;
	};

	getItem = async (id: number): Promise<APIResponseItem> => {
		const cachedData = cache.items.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - Item ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/item/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.items.push({
			id: id,
			data: data.data,
		});
		log.info(`Cache - MISS - Item ${id}`);
		return data.data;
	};

	getMachine = async (id: number): Promise<APIResponseMachine> => {
		const cachedData = cache.machines.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - TM ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/machine/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.machines.push({
			id: id,
			data: data.data,
		});
		log.info(`Cache - MISS - TM ${id}`);
		return data.data;
	};

	getMove = async (id: number): Promise<APIResponseMove> => {
		const cachedData = cache.moves.find(a => a.id === id);
		if (cachedData) {
			log.info(`Cache - HIT - Move ${id}`);
			return cachedData.data;
		}

		const data = await axios.get(`${this.api}/move/${id}`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
		});

		cache.moves.push({
			id: id,
			data: data.data,
		});
		log.info(`Cache - MISS - Move ${id}`);
		return data.data;
	};

	attackSprite = (name: "physical" | "special" | "status"): string => {
		if (name === "physical") return "/static/assets/attack-types/physical.png";
		if (name === "special") return "/static/assets/attack-types/special.png";
		if (name === "status") return "/static/assets/attack-types/status.png";
		return "";
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
		return "";
	};

	findPokemonNameFromId = (id: number): PokemonName | undefined => {
		const result = Pokemon.find(a => a.id === id);
		if (!result) return undefined;

		let primaryName = "";
		let secondaryName = "";
		result.names.forEach(b => {
			for (const [key, value] of Object.entries(b)) {
				if (key === this.primaryLangKey) primaryName = value;
				else if (key === this.secondaryLangKey) secondaryName = value;
			}
		});

		return {
			primaryLang: primaryName,
			secondaryLang: secondaryName,
			id: result.id,
			link: `/pokemon/${result.id}`,
			sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${result.id}.png`,
		};
	};

	findPokemonFromName = (name: string): PokemonName[] => {
		const regex = new RegExp(
			`${name
				.split("")
				.map(char => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const results: PokemonName[] = [];

		Pokemon.forEach(a => {
			let primaryName = "";
			let secondaryName = "";
			a.names.forEach(b => {
				for (const [key, value] of Object.entries(b)) {
					if (key === this.primaryLangKey) primaryName = value;
					else if (key === this.secondaryLangKey) secondaryName = value;
				}
			});

			if (
				primaryName.match(regex) ||
				secondaryName.match(regex) ||
				a.id.toString() === name
			)
				results.push({
					primaryLang: primaryName,
					secondaryLang: secondaryName,
					id: a.id,
					link: `/pokemon/${a.id}`,
					sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${a.id}.png`,
				});
		});

		return results;
	};

	findItemFromName = (name: string): ItemResult[] => {
		name = name.toLocaleLowerCase();

		const regex = new RegExp(
			`${name
				.split("")
				.map(char => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const results: ItemResult[] = [];
		Items.forEach(a => {
			let primaryName = "";
			let secondaryName = "";

			a.names.forEach(b => {
				for (const [key, value] of Object.entries(b)) {
					if (key === this.primaryLangKey) primaryName = value;
					else if (key === this.secondaryLangKey) secondaryName = value;
				}
			});
			if (
				regex.test(primaryName) ||
				regex.test(secondaryName) ||
				a.id.toString() === name
			)
				results.push({
					id: a.id,
					name: a.name,
					link: `/item/${a.id}`,
					primaryLang: primaryName,
					secondaryLang: secondaryName,
				});
		});

		return results;
	};

	findAbilityFromName = (name: string): AbilityResult[] => {
		name = name.toLocaleLowerCase();

		const regex = new RegExp(
			`${name
				.split("")
				.map(char => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const results: AbilityResult[] = [];
		Abilities.forEach(a => {
			let primaryName = "";
			let secondaryName = "";

			a.names.forEach(b => {
				for (const [key, value] of Object.entries(b)) {
					if (key === this.primaryLangKey) primaryName = value;
					else if (key === this.secondaryLangKey) secondaryName = value;
				}
			});

			if (regex.test(primaryName) || regex.test(secondaryName)) {
				results.push({
					primaryLang: primaryName,
					secondaryLang: secondaryName,
					id: a.id,
					link: `/ability/${a.id}`,
				});
			}
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
			if (results.length === this.searchResults) {
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

		let hasEvolutionChain = false;
		if (speciesData.evolution_chain) {
			const evolutionURL = speciesData.evolution_chain?.url.split("/");
			const evolutionId = evolutionURL[evolutionURL.length - 2];
			promises.push(this.getEvolutionChain(parseInt(evolutionId)));
			hasEvolutionChain = true;
		}

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

		let evolution: APIResponseEvolution | undefined = undefined;
		if (hasEvolutionChain) {
			evolution = results.splice(0, 1)[0] as APIResponseEvolution;
		}
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
