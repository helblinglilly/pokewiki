import axios from "axios";
import log from "./log";
import { host, port } from "./api/app";
import {
	GenericEntry,
	Moves,
	PokemonName,
	PokemonDetails,
	APIResponsePokemon,
	APIResponseSpecies,
	APIResponseEvolution,
	APIResponseAbility,
	Collection,
	MoveDetails,
	Evolution,
	EvolutionChain,
} from "./types";

const searchLimit = 10;

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
		id: number,
		game?: string
	): Promise<PokemonDetails | void> => {
		let pokemonData: APIResponsePokemon;
		let speciesData: APIResponseSpecies;
		let evolutionData: APIResponseEvolution;
		let allTypes: { english_id: string; sprite: string }[];
		let abilitiesData: APIResponseAbility[] = [];
		let allMoves: Moves[] = [];
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
			this.getGeneric("moves.json"),
		]);

		pokemonData = results[0].data;
		speciesData = results[1].data;
		allTypes = results[2].data;
		allMoves = results[3] as Moves[];

		const extraPromises = [
			speciesData.evolution_chain !== null
				? axios.get(speciesData.evolution_chain.url, {
						headers: { "Accept-Encoding": "gzip,deflate,compress" },
				  })
				: new Promise<any>((resolve) => resolve([])),
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

		// Abilities
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

		// Names
		const german = speciesData.names.find(
			(name) => name.language.name === "de"
		);

		const english = speciesData.names.find(
			(name) => name.language.name === "en"
		);

		// Pokemon Types
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

		// Stats
		let stats = {
			hp: {},
			attack: {},
			defense: {},
			special_attack: {},
			special_defense: {},
			speed: {},
		};

		pokemonData.stats.forEach((stat) => {
			if (stat.stat.name === "hp")
				stats.hp = {
					stat: stat.base_stat,
					effort: stat.effort,
				};
			else if (stat.stat.name === "attack")
				stats.attack = {
					stat: stat.base_stat,
					effort: stat.effort,
				};
			else if (stat.stat.name === "defense")
				stats.defense = {
					stat: stat.base_stat,
					effort: stat.effort,
				};
			else if (stat.stat.name === "special-attack")
				stats.special_attack = {
					stat: stat.base_stat,
					effort: stat.effort,
				};
			else if (stat.stat.name === "special-defense")
				stats.special_defense = {
					stat: stat.base_stat,
					effort: stat.effort,
				};
			else if (stat.stat.name === "speed")
				stats.speed = {
					stat: stat.base_stat,
					effort: stat.effort,
				};
		});

		// Game specific sections
		let moveset: MoveDetails[] = [];
		const games: string[] = [];
		if (game) {
			const game1 = game.split("-")[0];
			const game2 = game.split("-")[1];
			games.push(game1);
			if (game2 !== undefined) games.push(game2);

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

			// Moves
			moveset = this.processMoveset(
				allMoves,
				pokemonData.moves,
				game1,
				game2
			);
		}

		// Evolution
		const evolutions: Evolution[] = this.getEvolutions(evolutionData);
		if (id === 234 || id === 899) {
			// Stantler to Wyredeer in Legends
			evolutions.push({
				sourceURL: `/pokemon/234`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/234.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Use Psyshield Bash 20 times in Agile Style",
					},
				],
				targetURL: `/pokemon/889`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/899.png`,
			});
		}

		if (id === 211 || id === 904) {
			// Qwilfish to Overqwil in Legends
			evolutions.push({
				sourceURL: `/pokemon/211`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/211.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Use Barb Barrage 20 times in Strong Style",
					},
				],
				targetURL: `/pokemon/904`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/904.png`,
			});
		}

		if (id === 550 || id === 902) {
			// Basculin to Basculegion
			evolutions.push({
				sourceURL: `/pokemon/550`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/550.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Lose at least 294 HP from recoil damage",
					},
				],
				targetURL: `/pokemon/902`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/902.png`,
			});
		}

		if (id === 808 || id === 809) {
			// Meltan to Melmetal
			evolutions.push({
				sourceURL: `/pokemon/808`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/808.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Evolve in Pokémon Go - 400 Meltan Candy",
					},
				],
				targetURL: `/pokemon/809`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/809.png`,
			});
		}

		return {
			german: german ? german.name : "",
			english: english ? english.name : "",
			id: id,
			link: `/pokemon/${id}`,
			sprite: pokemonData.sprites.front_default,
			backSprite: pokemonData.sprites.back_default,
			shinySprite: pokemonData.sprites.front_shiny,
			shinyBackSprite: pokemonData.sprites.back_shiny,
			types: types,
			selectedGames: games,
			pokedex: pokedexEntries,
			weight: parseFloat(
				pokemonData.weight.toString().slice(0, -1) +
					"." +
					pokemonData.weight
						.toString()
						.charAt(pokemonData.weight.toString().length - 1)
			),
			height: pokemonData.height,
			evolutions: evolutions,
			abilities: abilities,
			captureRate: speciesData.capture_rate,
			growthRate:
				speciesData.growth_rate.name[0].toUpperCase() +
				speciesData.growth_rate.name.substring(1),
			moveset: moveset,
			baseStats: stats,
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

	static getEvolutions = (
		evolutionData: APIResponseEvolution
	): Evolution[] => {
		const results: Evolution[] = [];
		if (evolutionData === undefined) return [];
		let sourceID = evolutionData.chain.species.url.split("/")[6];

		const process = (evolution: EvolutionChain) => {
			const targetID = evolution.species.url.split("/")[6];

			evolution.evolution_details.forEach((details) => {
				let trigger = "";
				const requirements: {
					type: string;
					info: string;
					supplementary?: string;
				}[] = [];

				if (details.trigger.name === "level-up") {
					if (details.min_level)
						trigger = `Level ${details.min_level}`;
					else trigger = "Level Up";
				} else if (details.trigger.name === "use-item") {
					trigger = "use-item";
					requirements.push({
						type: "use-item",
						info: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${details.item.name}.png`,
						supplementary: `/item/${
							details.item.url.split("/")[6]
						}`,
					});
				} else if (details.trigger.name === "shed") {
					trigger = "shed";
					requirements.push({
						type: "shed",
						info: `Hello`,
						supplementary: `World`,
					});
				} else if (details.trigger.name === "three-critical-hits") {
					trigger = "three-critical-hits";
					requirements.push({
						type: "three-critical-hits",
						info: "",
					});
				} else {
					trigger = details.trigger.name;
				}

				if (details.gender !== null) {
					if (details.gender == "1")
						requirements.push({ type: "gender", info: "Female" });
					if (details.gender == "2")
						requirements.push({ type: "gender", info: "Male" });
				}

				if (details.held_item !== null) {
					requirements.push({
						type: "hold-item",
						info: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${details.held_item.name}.png`,
						supplementary: `/item/${
							details.held_item.url.split("/")[6]
						}`,
					});
				}

				if (details.min_happiness !== null) {
					requirements.push({
						type: "friendship",
						info: details.min_happiness,
					});
				}

				if (details.min_beauty !== null) {
					requirements.push({
						type: "beauty",
						info: details.min_beauty,
					});
				}

				if (details.needs_overworld_rain === true) {
					requirements.push({
						type: "rain",
						info: "Raining",
					});
				}

				if (details.time_of_day) {
					requirements.push({
						type: "daytime",
						info: details.time_of_day,
					});
				}

				if (details.trade_species) {
					requirements.push({
						type: "trade_for",
						info:
							details.trade_species.name[0].toUpperCase() +
							details.trade_species.name.slice(1),
						supplementary: `/pokemon/${
							details.trade_species.url.split("/")[6]
						}`,
					});
				}

				if (details.party_species !== null) {
					requirements.push({
						type: "party_have",
						info:
							details.party_species.name[0].toUpperCase() +
							details.party_species.name.slice(1),
						supplementary: `/pokemon/${
							details.party_species.url.split("/")[6]
						}`,
					});
				}

				if (details.party_type !== null) {
					let tidyType = details.party_type.name;
					tidyType = tidyType[0].toUpperCase() + tidyType.slice(1);
					requirements.push({
						type: "party_type",
						info: `Party to have another ${tidyType} Pokémon`,
					});
				}

				if (details.turn_upside_down) {
					requirements.push({
						type: "other",
						info: "Turn 3DS/Switch Upside Down",
					});
				}

				if (details.relative_physical_stats !== null) {
					if (details.relative_physical_stats === -1) {
						requirements.push({
							type: "stats",
							info: "Defensive > Attack",
						});
					} else if (details.relative_physical_stats === 1) {
						requirements.push({
							type: "stats",
							info: "Attack > Defensive",
						});
					} else if (details.relative_physical_stats === 0) {
						requirements.push({
							type: "stats",
							info: "Attack = Defensive",
						});
					}
				}

				if (details.known_move !== null) {
					let tidyMoveName = details.known_move.name;
					const words = tidyMoveName.split("-").map((word) => {
						return word[0].toUpperCase() + word.slice(1);
					});
					tidyMoveName = words.join(" ");
					requirements.push({
						type: "know_move",
						info: `/move/${details.known_move.url.split("/")[6]}`,
						supplementary: tidyMoveName,
					});
				}

				if (details.known_move_type !== null) {
					requirements.push({
						type: "know_move_type",
						info:
							details.known_move_type.name[0].toUpperCase() +
							details.known_move_type.name.slice(1),
					});
				}

				if (details.min_affection !== null) {
					requirements.push({
						type: "affection",
						info: details.min_affection,
					});
				}

				if (details.location !== null) {
					let tidyLocation = details.location.name;
					const words = tidyLocation.split("-").map((word) => {
						return word[0].toUpperCase() + word.slice(1);
					});
					tidyLocation = words.join(" ");

					requirements.push({
						type: "location",
						info: tidyLocation,
					});
				}

				if (details.trigger.name === "take-damage") {
					if (
						sourceID === "562" ||
						sourceID === "867" ||
						sourceID === "563"
					) {
						// Yamask to Runerigus
						results.push({
							sourceURL: `/pokemon/562`,
							sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/562.png`,
							trigger: "other",
							requirements: [
								{
									type: "other",
									info: "Go through the Stone Gate in the Dusty Bowl after Yamask has lost more than 49 HP from one attack and did not faint in that battle - or since",
								},
							],
							targetURL: `/pokemon/867`,
							targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/867.png`,
						});
						return;
					}
				}

				results.push({
					sourceURL: `/pokemon/${sourceID}`,
					sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${sourceID}.png`,
					trigger: trigger,
					requirements: requirements,
					targetURL: `/pokemon/${targetID}`,
					targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetID}.png`,
				});
			});
			evolution.evolves_to.forEach((direction) => {
				sourceID = targetID;
				process(direction);
			});
		};

		evolutionData.chain.evolves_to.forEach((evolution) => {
			process(evolution);
		});

		return results;
	};

	static processMoveset = (
		allMoves: Moves[],
		moves: APIResponsePokemon["moves"],
		game1: string,
		game2?: string
	): MoveDetails[] => {
		const moveset: MoveDetails[] = [];

		const levelMoves: MoveDetails[] = [];
		const tmMoves: MoveDetails[] = [];
		const eggMoves: MoveDetails[] = [];
		const tutorMoves: MoveDetails[] = [];
		moves.forEach((move) => {
			move.version_group_details.forEach((version) => {
				if (
					version.version_group.name.includes(game1) ||
					(game2 !== undefined &&
						version.version_group.name.includes(game2))
				) {
					const moveDetail = allMoves.find(
						(a) => a.english_id === move.move.name
					);
					if (moveDetail !== undefined) {
						const move = {
							...moveDetail,
							learning_method: version.move_learn_method.name,
							level_learnt: version.level_learned_at,
						};

						if (
							move.learning_method === "level-up" &&
							levelMoves.filter((a) => a.english === move.english)
								.length === 0
						) {
							levelMoves.push(move);
						}

						if (
							move.learning_method === "egg" &&
							eggMoves.filter((a) => a.english === move.english)
								.length === 0
						) {
							eggMoves.push(move);
						}

						if (
							move.learning_method === "machine" &&
							tmMoves.filter((a) => a.english === move.english)
								.length === 0
						) {
							tmMoves.push(move);
						}

						if (
							move.learning_method === "tutor" &&
							tutorMoves.filter((a) => a.english === move.english)
								.length === 0
						) {
							tutorMoves.push(move);
						}
					}
				}
			});
		});

		levelMoves.sort((a, b) => (a.level_learnt > b.level_learnt ? 1 : -1));
		tmMoves.sort((a, b) => (a.type > b.type ? 1 : -1));
		eggMoves.sort((a, b) => (a.type > b.type ? 1 : -1));
		tutorMoves.sort((a, b) => (a.type > b.type ? 1 : -1));

		return levelMoves.concat(tmMoves, eggMoves, tutorMoves);
	};
}

export default Model;
