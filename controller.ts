import log from "./log";
import Moves from "./public/pokedata/moves.json";
import Types from "./public/pokedata/types.json";
import Utils from "./utils";
import { Data } from "./model";
import {
	PokemonDetails,
	APIResponsePokemon,
	APIResponseEvolution,
	Collection,
	MoveDetails,
	Evolution,
	EvolutionChain,
	Games,
	VersionGroup,
	GenericSprites,
} from "./types";

const data = new Data();

class Controller {
	primaryLanguageCode: string;
	secondaryLanguageCode: string;

	static notFoundSprite =
		"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

	constructor(primLang: string, secLang: string) {
		this.primaryLanguageCode = primLang;
		this.secondaryLanguageCode = secLang;
	}

	getPokemonDetail = async (
		id: number,
		varietyId: number,
		game?: string
	): Promise<PokemonDetails | void> => {
		const apidata = await data.pokemonData(id, varietyId);
		const pokemonData = apidata.pokemon;
		const speciesData = apidata.species;
		const evolutionData = apidata.evolution;
		const abilitiesData = apidata.abilities;
		const formData = apidata.forms;
		const varietiesData = apidata.varieties;
		const pokedexEntries: { game: string; entry: string }[] = [];

		// Names
		const primName = Utils.findNameFromLanguageCode(
			speciesData.names,
			this.primaryLanguageCode
		);
		const secName = Utils.findNameFromLanguageCode(
			speciesData.names,
			this.secondaryLanguageCode
		);

		let showcaseSprites = Utils.getPokemonSprite(
			pokemonData.sprites,
			"full",
			"default",
			game
		);

		// Abilities
		const abilities = abilitiesData.map(entry => {
			const pkmnAbility = pokemonData.abilities.find(a => a.ability.name === entry.name);
			const name = Utils.findNameFromLanguageCode(entry.names, "en");
			const isHidden = pkmnAbility && pkmnAbility.is_hidden ? true : false;
			const effectEntry = entry.effect_entries.find(a => a.language.name === "en");

			return {
				name: name ? name : entry.name,
				effect: effectEntry ? effectEntry.short_effect : "Unknown",
				isHidden: isHidden,
				link: `/ability/${entry.id}`,
			};
		});

		// Types
		let types: { name: string; sprite: string }[] = [];
		pokemonData.types.forEach(pokeType => {
			const lookupType = Types.find(a => a.english_id === pokeType.type.name);
			types.push({
				name: lookupType ? lookupType.english : "?",
				sprite: lookupType ? lookupType.sprite : Controller.notFoundSprite,
			});
		});

		// Alternative forms
		const forms: {
			name: string;
			url: string;
			sprites: GenericSprites;
		}[] = [];

		formData.forEach(form => {
			let name = Utils.findNameFromLanguageCode(
				form.form_names,
				this.primaryLanguageCode
			);
			name = name ? name : primName;

			if (speciesData.has_gender_differences) {
				forms.push({
					name: name + " ♀",
					sprites: Utils.getPokemonSprite(form.sprites, "form", "alternative", game),
					url: `/pokemon/${id}`,
				});
				name += " ♂";
			}

			forms.push({
				name: name,
				sprites: Utils.getPokemonSprite(form.sprites, "form", "default", game),
				url: `/pokemon/${id}`,
			});
		});

		varietiesData.forEach((variety, i) => {
			let name = `Form ${i}`;
			if (variety.forms.length > 0) {
				name = variety.forms[0].name;
			}
			let parts = name.split("-");
			parts = parts.map(word => word[0].toUpperCase() + word.slice(1));
			name = parts.join(" ");
			if (varietyId !== 0 && variety.id === id) {
				// The whole entry is for a variety, and this is the OG
				forms.push({
					name: name,
					sprites: Utils.getPokemonSprite(variety.sprites, "form", "default", game),
					url: `/pokemon/${id}`,
				});
			} else if (varietyId !== 0 && variety.id !== varietyId) {
				// This is a variety and the current entry is for the same one
				forms.push({
					name: name,
					sprites: Utils.getPokemonSprite(variety.sprites, "form", "default", game),
					url: `/pokemon/${id}?variety=${variety.id}`,
				});
			} else if (varietyId === 0 && variety.id !== id) {
				// This is the OG and there's a bunch of varieties - don't double count yourself
				forms.push({
					name: name,
					sprites: Utils.getPokemonSprite(variety.sprites, "form", "default", game),
					url: `/pokemon/${id}?variety=${variety.id}`,
				});
			}
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

		pokemonData.stats.forEach(stat => {
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
		const selectedGames = Games.findEntry(game ? game : "all");

		if (selectedGames.version_group_name !== "all") {
			// Pokédex entries
			speciesData.flavor_text_entries.forEach(entry => {
				if (selectedGames.consistsOf.includes(entry.version.name)) {
					if (entry.language.name === this.primaryLanguageCode) {
						pokedexEntries.push({
							game: entry.version.name,
							entry: entry.flavor_text,
						});
					}
				}
			});

			if (selectedGames !== undefined) {
				// Moves
				moveset = Controller.processMoveset(pokemonData.moves, selectedGames);

				// Past Types
				const selectedGenIndex = Games.generationOrder.findIndex(
					a => a === selectedGames?.generation
				);

				let oldTypes: { name: string; sprite: string }[] = [];
				pokemonData.past_types.forEach(pastEntry => {
					const pastGenIndex = Games.generationOrder.findIndex(
						a => a == pastEntry.generation.name.split("-")[1]
					);

					if (selectedGenIndex <= pastGenIndex) {
						Types.forEach(allType => {
							pastEntry.types.forEach(oldType => {
								if (allType.english_id === oldType.type.name) {
									oldTypes.push({
										name: allType.english_id,
										sprite: allType.sprite,
									});
								}
							});
						});
					}
				});

				if (oldTypes.length > 0) {
					types = oldTypes;
				}
			}
		}

		// Evolution
		const evolutions: Evolution[] = Controller.getEvolutions(evolutionData);
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

		let growthRate = "Unknown";
		if (speciesData.growth_rate) {
			growthRate =
				speciesData.growth_rate.name[0].toUpperCase() +
				speciesData.growth_rate.name.substring(1);
		}

		return {
			german: primName,
			english: secName,
			id: id,
			link: `/pokemon/${id}`,
			sprites: showcaseSprites,
			forms: forms,
			types: types,
			selectedGames: selectedGames,
			pokedex: pokedexEntries,
			weight: parseFloat(
				pokemonData.weight.toString().slice(0, -1) +
					"." +
					pokemonData.weight.toString().charAt(pokemonData.weight.toString().length - 1)
			),
			height: pokemonData.height,
			evolutions: evolutions,
			abilities: abilities,
			captureRate: speciesData.capture_rate,
			growthRate: growthRate,
			moveset: moveset,
			baseStats: stats,
		};
	};

	// TODO should not make this static so that custom languages can be supported
	static getSearchResults = async (
		searchTerm: string,
		pokemon: boolean,
		items: boolean,
		moves: boolean,
		abilities: boolean
	): Promise<Collection> => {
		const pkmnResults = pokemon ? data.findPokemonFromName(searchTerm) : [];
		const itemResults = items ? data.findItemFromName(searchTerm) : [];
		const moveResults = moves ? data.findMoveFromName(searchTerm) : [];
		const abilityResults = abilities ? data.findAbilityFromName(searchTerm) : [];

		return {
			Pokemon: pkmnResults,
			Items: itemResults,
			Moves: moveResults,
			Abilities: abilityResults,
		};
	};

	static getEvolutions = (evolutionData: APIResponseEvolution): Evolution[] => {
		const results: Evolution[] = [];
		if (evolutionData === undefined) return [];
		let sourceID = evolutionData.chain.species.url.split("/")[6];

		const process = (evolution: EvolutionChain) => {
			const targetID = evolution.species.url.split("/")[6];

			evolution.evolution_details.forEach(details => {
				let trigger = "";
				const requirements: {
					type: string;
					info: string;
					supplementary?: string;
				}[] = [];

				if (details.trigger.name === "level-up") {
					if (details.min_level) trigger = `Level ${details.min_level}`;
					else trigger = "Level Up";
				} else if (details.trigger.name === "use-item") {
					trigger = "use-item";
					requirements.push({
						type: "use-item",
						info: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${details.item.name}.png`,
						supplementary: `/item/${details.item.url.split("/")[6]}`,
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
					if (details.gender == "2") requirements.push({ type: "gender", info: "Male" });
				}

				if (details.held_item !== null) {
					requirements.push({
						type: "hold-item",
						info: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${details.held_item.name}.png`,
						supplementary: `/item/${details.held_item.url.split("/")[6]}`,
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
						supplementary: `/pokemon/${details.trade_species.url.split("/")[6]}`,
					});
				}

				if (details.party_species !== null) {
					requirements.push({
						type: "party_have",
						info:
							details.party_species.name[0].toUpperCase() +
							details.party_species.name.slice(1),
						supplementary: `/pokemon/${details.party_species.url.split("/")[6]}`,
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
					const words = tidyMoveName.split("-").map(word => {
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
					const words = tidyLocation.split("-").map(word => {
						return word[0].toUpperCase() + word.slice(1);
					});
					tidyLocation = words.join(" ");

					requirements.push({
						type: "location",
						info: tidyLocation,
					});
				}

				if (details.trigger.name === "take-damage") {
					if (sourceID === "562" || sourceID === "867" || sourceID === "563") {
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
			evolution.evolves_to.forEach(direction => {
				sourceID = targetID;
				process(direction);
			});
		};

		evolutionData.chain.evolves_to.forEach(evolution => {
			process(evolution);
		});

		return results;
	};

	static processMoveset = (
		moves: APIResponsePokemon["moves"],
		toBeFoundVersionGroup: VersionGroup
	): MoveDetails[] => {
		const levelMoves: MoveDetails[] = [];
		const tmMoves: MoveDetails[] = [];
		const eggMoves: MoveDetails[] = [];
		const tutorMoves: MoveDetails[] = [];
		moves.forEach(move => {
			move.version_group_details.forEach(version => {
				const foundVersion = Games.findEntry(version.version_group.name);
				if (
					foundVersion !== undefined &&
					foundVersion.version_group_name === toBeFoundVersionGroup.version_group_name
				) {
					const moveDetail = Moves.find(a => a.english_id === move.move.name);
					if (moveDetail !== undefined) {
						const move = {
							...moveDetail,
							learning_method: version.move_learn_method.name,
							level_learnt: version.level_learned_at,
						};

						if (
							move.learning_method === "level-up" &&
							levelMoves.filter(a => a.english === move.english).length === 0
						) {
							levelMoves.push(move);
						}

						if (
							move.learning_method === "egg" &&
							eggMoves.filter(a => a.english === move.english).length === 0
						) {
							eggMoves.push(move);
						}

						if (
							move.learning_method === "machine" &&
							tmMoves.filter(a => a.english === move.english).length === 0
						) {
							tmMoves.push(move);
						}

						if (
							move.learning_method === "tutor" &&
							tutorMoves.filter(a => a.english === move.english).length === 0
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

export default Controller;
