import axios from "axios";
import log from "./log";
import { host, port } from "./api/app";

const searchLimit = 10;

interface GenericEntry {
	german: string;
	english: string;
	english_id: string;
	id: number;
	link: string;
	sprite: string;
}

interface Moves extends GenericEntry {
	attack_type: "physical" | "special" | "status";
	attack_type_sprite: string;
	type: string;
	type_sprite: string;
}

interface PokemonName {
	german: string;
	english: string;
	id: number;
	link: string;
	sprite: string;
}

interface Collection {
	Abilities?: GenericEntry[];
	Items?: GenericEntry[];
	Moves?: Moves[];
	Types?: GenericEntry[];
	Pokemon?: PokemonName[];
}

interface PokemonDetails extends PokemonName {
	types: {
		name: string;
		sprite: string;
	}[];
	backSprite: string;
	shinySprite: string;
	shinyBackSprite: string;
	captureRate: number;
	growthRate: string;
	evolution?: {
		means: string;
		requirements: string;
		target: PokemonDetails;
	};
	pokedex?: {
		game: string;
		entry: string;
	}[];
	abilities: {
		name: string;
		effect: string;
		isHidden: boolean;
		link: string;
	}[];
	moveset: {
		german: string;
		english: string;
		link: string;
		attack_type: "physical" | "special" | "status";
		attack_type_sprite: string;
		type: string;
		type_sprite: string;
		learning_method: string;
	}[];
}

interface APIResponsePokemon {
	abilities: {
		ability: {
			name: string;
			url: string;
		};
		is_hidden: boolean;
	}[];
	types: {
		type: {
			name: string;
		};
	}[];
}

interface APIResponseAbility {
	name: string;
	names: {
		language: {
			name: string;
		};
		name: string;
	}[];
	id: string;
	effect_changes: {
		effect: string;
		language: {
			name: string;
		};
		version_group: {
			name: string;
		};
	}[];
	effect_entries: {
		effect: string;
		short_effect: string;
		language: {
			name: string;
		};
	}[];
	flavor_text_entries: {
		flavor_text: string;
		language: {
			name: string;
		};
		version_group: {
			name: string;
		};
	}[];
}

interface APIResponseSpecies {
	evolution_chain: {
		url: string;
	};
	capture_rate: number;
	growth_rate: {
		name: string;
	};
	names: {
		language: {
			name: string;
			url: string;
		};
		name: string;
	}[];
	flavor_text_entries: {
		flavor_text: string;
		language: {
			name: string;
		};
		version: {
			name: string;
		};
	}[];
}

interface APIResponseEvolution {
	id: number;
}

class Model {
	static getGeneric = async (
		location: "abilities.json" | "types.json" | "moves.json" | "items.json",
		searchTerm?: string
	): Promise<GenericEntry[]> => {
		let entries: GenericEntry[] = [];
		try {
			const result = await axios.get(
				`${host}:${port}/static/pokedata/${location}`,
				{
					headers: { "Accept-Encoding": "gzip,deflate,compress" },
				}
			);
			entries = result.data;
		} catch (error) {
			log.error(
				`Failed to fetch ${host}:${port}${location} with error ${error}`
			);
		}

		entries = entries.map((entry) => {
			if (location === "abilities.json") {
				entry.link = `/ability/${entry.id}`;
			} else if (location === "items.json") {
				entry.link = `/item/${entry.id}`;
				entry.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${entry.english_id}.png`;
			} else if (location === "moves.json") {
				const move = entry as Moves;
				move.link = `/move/${entry.id}`;
				if (move.attack_type === "physical")
					move.attack_type_sprite =
						"https://i.stack.imgur.com/UATOp.png";
				else if (move.attack_type === "special")
					move.attack_type_sprite =
						"https://i.stack.imgur.com/dS0qQ.png";
				else if (move.attack_type === "status")
					move.attack_type_sprite =
						"https://i.stack.imgur.com/LWKMo.png";

				entry = move;
			} else if (location === "types.json") {
				entry.link = `/type/${entry.id}`;
			}
			return entry;
		});

		if (searchTerm === undefined || entries.length === 0) return entries;

		const searchRegex = new RegExp(
			`${searchTerm
				.split("")
				.map((char) => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const filtered: GenericEntry[] = [];
		entries.forEach((entry) => {
			if (filtered.length < searchLimit) {
				if (searchRegex.test(entry.english)) filtered.push(entry);
				else if (searchRegex.test(entry.german)) filtered.push(entry);
			}
		});

		return filtered;
	};

	static getPokemonOverview = async (
		searchTerm?: string
	): Promise<PokemonName[]> => {
		let pokemon: PokemonName[] = [];
		try {
			const result = await axios.get(
				`${host}:${port}/static/pokedata/pokemon.json`,
				{
					headers: { "Accept-Encoding": "gzip,deflate,compress" },
				}
			);
			pokemon = result.data;
		} catch (error) {
			log.error(
				`Failed to fetch ${host}:${port}/static/pokedata/pokemon.json with error ${error}`
			);
		}

		pokemon = pokemon.map((mon) => {
			mon.link = `/pokemon/${mon.id}`;
			return mon;
		});

		if (searchTerm === undefined || pokemon.length === 0) return pokemon;

		const searchRegex = new RegExp(
			`${searchTerm
				.split("")
				.map((char) => `${char}\\s*`)
				.join("")}`,
			"gi"
		);

		const filtered: PokemonName[] = [];
		pokemon.forEach((mon) => {
			if (filtered.length < searchLimit) {
				if (searchRegex.test(mon.english)) filtered.push(mon);
				else if (searchRegex.test(mon.german)) filtered.push(mon);
				else if (searchTerm === mon.id.toString()) filtered.push(mon);
			}
		});
		return filtered;
	};

	static getPokemonDetail = async (
		id: string,
		game?: string
	): Promise<PokemonDetails | void> => {
		let pokemonData: APIResponsePokemon;
		let speciesData: APIResponseSpecies;
		let evolutionData: APIResponseEvolution;
		let allTypes: { english_id: string; sprite: string }[];
		let abilitiesData: APIResponseAbility[] = [];
		const pokedexEntries: { game: string; entry: string }[] = [];

		const results = await Promise.all([
			axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			}),
			axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`, {
				headers: {
					"Accept-Encoding": "gzip,deflate,compress",
				},
			}),
			axios.get(`${host}:${port}/static/pokedata/types.json`, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			}),
		]);

		pokemonData = results[0].data;
		speciesData = results[1].data;
		allTypes = results[2].data;

		const extraPromises = [
			axios.get(speciesData.evolution_chain.url, {
				headers: { "Accept-Encoding": "gzip,deflate,compress" },
			}),
		];
		pokemonData.abilities.forEach((ability) =>
			extraPromises.push(
				axios.get(ability.ability.url, {
					headers: { "Accept-Encoding": "gzip,deflate,compress" },
				})
			)
		);
		const extraResults = await Promise.all(extraPromises);
		evolutionData = extraResults[0].data;

		extraResults.forEach((entry, i) => {
			if (i !== 0) abilitiesData.push(entry.data);
		});

		const abilities = abilitiesData.map((entry) => {
			let name = entry.name;
			let isHidden = false;
			let effect = "";
			pokemonData.abilities.forEach((ability) => {
				if (ability.ability.name === entry.name) {
					isHidden = ability.is_hidden;
				}
			});
			entry.names.forEach((a) => {
				if (a.language.name === "en") name = a.name;
			});

			entry.effect_entries.forEach((a) => {
				if (a.language.name === "en") {
					effect = a.short_effect;
				}
			});

			return {
				name: name,
				effect: effect,
				isHidden: isHidden,
				link: `/ability/${entry.id}`,
			};
		});

		const german = speciesData.names.find(
			(name) => name.language.name === "de"
		);

		const english = speciesData.names.find(
			(name) => name.language.name === "en"
		);

		const types: { name: string; sprite: string }[] = [];
		allTypes.forEach((allType) => {
			pokemonData.types.forEach((pokeType) => {
				if (allType.english_id === pokeType.type.name) {
					types.push({
						name: allType.english_id,
						sprite: allType.sprite,
					});
				}
			});
		});

		if (game) {
			const game1 = game.split("-")[0];
			const game2 = game.split("-")[1];

			speciesData.flavor_text_entries.forEach((entry) => {
				if (
					(game1 === entry.version.name ||
						(game2 !== undefined &&
							entry.version.name === game2)) &&
					entry.language.name === "en"
				) {
					pokedexEntries.push({
						game: entry.version.name,
						entry: entry.flavor_text,
					});
				}
			});
		}

		return {
			german: german ? german.name : "",
			english: english ? english.name : "",
			id: parseInt(id),
			link: `/pokemon/${id}`,
			sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
			backSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
			shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
			shinyBackSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${id}.png`,
			types: types,
			pokedex: pokedexEntries,
			// evolution:
			abilities: abilities,
			captureRate: speciesData.capture_rate,
			growthRate:
				speciesData.growth_rate.name[0].toUpperCase() +
				speciesData.growth_rate.name.substring(1),
			moveset: [],
		};
	};

	static getSearchResults = async (
		searchTerm: string,
		pokemon: boolean,
		items: boolean,
		moves: boolean,
		abilities: boolean
	): Promise<Collection> => {
		const promises: any[] = [];

		promises.push(
			abilities
				? this.getGeneric("abilities.json", searchTerm)
				: new Promise<[]>((resolve) => resolve([]))
		);
		promises.push(
			items
				? this.getGeneric("items.json", searchTerm)
				: new Promise<[]>((resolve) => resolve([]))
		);
		promises.push(
			moves
				? this.getGeneric("moves.json", searchTerm)
				: new Promise<[]>((resolve) => resolve([]))
		);
		promises.push(
			pokemon
				? this.getPokemonOverview(searchTerm)
				: new Promise<[]>((resolve) => resolve([]))
		);

		return Promise.all(promises).then((values) => {
			return {
				Abilities: values[0],
				Items: values[1],
				Moves: values[2] as Moves[],
				Pokemon: values[3] as PokemonName[],
			};
		});
	};
}

export default Model;
