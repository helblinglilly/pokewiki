import log from "./log";
import Moves from "./data/moves.json";
import Types from "./data/types.json";
import Utils from "./utils";
import { Data } from "./model";
import {
	APIResponsePokemon,
	APIResponseEvolution,
	Collection,
	MoveDetails,
	Evolution,
	EvolutionChain,
	Games,
	VersionGroup,
	GenericSprites,
	APIResponseItem,
	PokemonName,
	APIResponseMachine,
} from "./types";
import { appSettings } from "../api/app";

class Controller {
	primaryLanguageCode: string;
	secondaryLanguageCode: string;
	data: Data;

	constructor(primLang: string, secLang: string) {
		this.primaryLanguageCode = primLang;
		this.secondaryLanguageCode = secLang;
		this.data = new Data(primLang, secLang);
	}

	getPokemonDetail = async (id: number, varietyId: number, game?: string) => {
		const apidata = await this.data.pokemonData(id, varietyId);
		const pokemonData = apidata.pokemon;
		const speciesData = apidata.species;
		const evolutionData = apidata.evolution;
		const abilitiesData = apidata.abilities;
		const formData = apidata.forms;
		const varietiesData = apidata.varieties;
		const pokedexEntries: { game: string; entry: string }[] = [];

		// Names
		let primName = Utils.findNameFromLanguageCode(
			speciesData.names,
			this.primaryLanguageCode
		);
		let secName = Utils.findNameFromLanguageCode(
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
			const name = Utils.findNameFromLanguageCode(entry.names, this.primaryLanguageCode);
			const isHidden = pkmnAbility && pkmnAbility.is_hidden ? true : false;
			const effectEntry = entry.effect_entries.find(
				a => a.language.name === this.primaryLanguageCode
			);

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
				sprite: lookupType
					? this.data.typeSprite(lookupType.english_id)
					: appSettings.placeholderImage,
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

			if (variety.id !== id && varietyId !== variety.id) {
				forms.push({
					name: name,
					sprites: Utils.getPokemonSprite(variety.sprites, "form", "default", game),
					url: `/pokemon/${id}?variety=${variety.id}`,
				});
			} else if (variety.id === id && varietyId !== 0) {
				forms.push({
					name: name,
					sprites: Utils.getPokemonSprite(variety.sprites, "form", "default", game),
					url: `/pokemon/${id}`,
				});
			}

			if (variety.id === varietyId) {
				const form = name.split(" ");
				form.shift();
				primName = form.join(" ") + " " + primName;
				secName = form.join(" ") + " " + secName;
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
							game: entry.version.name.replace(new RegExp("-", "g"), " "),
							entry: entry.flavor_text,
						});
					}
				}
			});

			if (selectedGames !== undefined) {
				// Moves
				moveset = this.processMoveset(pokemonData.moves, selectedGames);

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
										sprite: this.data.typeSprite(allType.english_id),
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
		let evolutions: Evolution[] = [];
		if (evolutionData) evolutions = Controller.getEvolutions(evolutionData);

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

		let growthRate = "No Data";
		if (speciesData.growth_rate) {
			growthRate =
				speciesData.growth_rate.name[0].toUpperCase() +
				speciesData.growth_rate.name.substring(1);
		}

		return {
			primaryName: primName,
			secondaryName: secName,
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

	getItem = async (id: number, game?: string) => {
		const [itemData, previousItemData, nextItemData] = await Promise.all([
			this.data.getItem(id),
			this.data.getItem(id - 1),
			this.data.getItem(id + 1),
		]);
		if (!itemData) return;

		let primaryLangName = "";
		let secondaryLangName = "";
		let previousItemName = "";
		let nextItemName = "";
		let primaryEntry = {
			game: "",
			entry: "",
			clickable: {
				state: false,
				url: "",
			},
		};
		let secondaryEntry = {
			game: "",
			entry: "",
			clickable: {
				state: false,
				url: "",
			},
		};

		// Attributes
		let countable = false;
		let consumable = false;
		let overworld = false;
		let battle = false;
		let holdable = false;
		let holdablePassive = false;
		let holdableActive = false;
		let underground = false;

		let cost = 0;

		let itemSprite = appSettings.placeholderImage;
		let previousItemSprite = appSettings.placeholderImage;
		let nextItemSprite = appSettings.placeholderImage;

		primaryLangName = Utils.findNameFromLanguageCode(
			itemData.names,
			this.primaryLanguageCode
		);
		secondaryLangName = Utils.findNameFromLanguageCode(
			itemData.names,
			this.secondaryLanguageCode
		);

		itemData.effect_entries.forEach((entry, i) => {
			if (entry.language.name === this.primaryLanguageCode) {
				primaryEntry.entry = entry.short_effect;
			} else if (itemData !== undefined && i === itemData.effect_entries.length - 1) {
				primaryEntry.entry = entry.short_effect;
			}
		});

		if (game) {
			const foundGame = Games.findEntry(game);
			if (foundGame.version_group_name !== "all") {
				let existsInGame = false;
				let primaryLangText = "";
				let secondaryLangText = "";
				itemData.flavor_text_entries.forEach(entry => {
					if (foundGame.version_group_name === entry.version_group.name) {
						existsInGame = true;

						if (entry.language.name === this.primaryLanguageCode) {
							primaryLangText = entry.text;
						} else if (entry.language.name === this.secondaryLanguageCode) {
							secondaryLangText = entry.text;
						}

						const game = foundGame.consistsOf.map(a => a[0].toUpperCase() + a.slice(1));
						secondaryEntry.game = game.join(" / ").replace(/-/g, " ");
					}
				});

				if ((existsInGame && primaryLangText) || secondaryLangText) {
					secondaryEntry.entry = primaryLangText ? primaryLangText : secondaryLangText;
				} else if (existsInGame) {
					secondaryEntry.entry = "No description found for the selected languages";
				} else {
					secondaryEntry.entry = "This item does not exist in this game";
				}

				if (itemData.machines.length > 0) {
					const correctEntry = itemData.machines.find(
						a => a.version_group.name === foundGame.version_group_name
					);
					if (correctEntry) {
						const id = correctEntry.machine.url.split("/")[6];
						const machineData = await this.data.getMachine(parseInt(id));
						const moveId = machineData.move.url.split("/")[6];
						const moveData = await this.data.getMove(parseInt(moveId));

						secondaryEntry.entry = Utils.findNameFromLanguageCode(
							moveData.names,
							this.primaryLanguageCode
						);
						secondaryEntry.clickable.state = true;
						secondaryEntry.clickable.url = `/move/${moveId}`;

						primaryLangName += ` ${secondaryEntry.entry}`;
						secondaryLangName = Utils.findNameFromLanguageCode(
							moveData.names,
							this.secondaryLanguageCode
						);
					} else {
						secondaryEntry.entry = "This TM does not exist in the selected game.";
					}
				}
			}
		}

		if (itemData.machines.length > 0) {
			primaryEntry.entry = "This item can teach a Pokémon a move.";
			if (!secondaryEntry.clickable.state) {
				primaryEntry.entry += " Select a game to see which move this TM corresponds to.";
			}
		}

		itemData.attributes.forEach(attribute => {
			if (attribute.name === "countable") countable = true;
			if (attribute.name === "consumable") consumable = true;
			if (attribute.name === "usable-overworld") overworld = true;
			if (attribute.name === "usable-in-battle") battle = true;
			if (attribute.name === "holdable") holdable = true;
			if (attribute.name === "holdable-passive") holdablePassive = true;
			if (attribute.name === "holdable-active") holdableActive = true;
			if (attribute.name === "underground") underground = true;
		});

		cost = itemData.cost;
		itemSprite = itemData.sprites.default;

		if (previousItemData) {
			previousItemName = Utils.findNameFromLanguageCode(
				previousItemData.names,
				this.primaryLanguageCode
			);
			previousItemSprite = previousItemData.sprites.default;
		}

		if (nextItemData) {
			nextItemName = Utils.findNameFromLanguageCode(
				nextItemData.names,
				this.primaryLanguageCode
			);
			nextItemSprite = nextItemData.sprites.default;
		}

		return {
			id: id,
			previousItemName: previousItemName,
			previousItemSprite: previousItemSprite,
			nextItemName: nextItemName,
			nextItemSprite: nextItemSprite,
			primaryName: primaryLangName,
			secondaryName: secondaryLangName,
			itemSprite: itemSprite,
			price: cost,
			countable: countable,
			consumable: consumable,
			overworld: overworld,
			battle: battle,
			holdable: holdable,
			holdablePassive: holdablePassive,
			holdableActive: holdableActive,
			underground: underground,
			primaryLangEntry: primaryEntry,
			secondaryLangEntry: secondaryEntry,
		};
	};

	getMove = async (id: number, game?: string) => {
		const moveData = await this.data.getMove(id);
		const machineDataPromises: Promise<APIResponseMachine>[] = [];

		moveData.machines.forEach(a => {
			const id = a.machine.url.split("/")[6];
			machineDataPromises.push(this.data.getMachine(parseInt(id)));
		});
		const machineData = await Promise.all(machineDataPromises);

		const primaryLang = Utils.findNameFromLanguageCode(
			moveData.names,
			this.primaryLanguageCode
		);
		const secondaryLang = Utils.findNameFromLanguageCode(
			moveData.names,
			this.secondaryLanguageCode
		);

		let primaryLangEffect = moveData.effect_entries.filter(
			a => a.language.name === this.primaryLanguageCode
		)[0]?.short_effect;
		let secondaryLangEffect = moveData.effect_entries.filter(
			a => a.language.name === this.secondaryLanguageCode
		)[0]?.short_effect;
		if (primaryLangEffect) {
			if (moveData.effect_chance) {
				primaryLangEffect = primaryLangEffect.replace(
					"$effect_chance",
					moveData.effect_chance.toString()
				);
			}
		}
		if (secondaryLangEffect) {
			if (moveData.effect_chance) {
				secondaryLangEffect = secondaryLangEffect.replace(
					"$effect_chance",
					moveData.effect_chance.toString()
				);
			}
		}

		let primaryFlavorText = moveData.flavor_text_entries.filter(a => {
			if (game) {
				const gameEntry = Games.findEntry(game);
				if (gameEntry.version_group_name === a.version_group.name) {
					return a.language.name === this.primaryLanguageCode;
				}
				return false;
			} else {
				return a.language.name === this.primaryLanguageCode;
			}
		})[0];
		let secondaryFlavorText = moveData.flavor_text_entries.filter(a => {
			if (game) {
				const gameEntry = Games.findEntry(game);
				if (gameEntry.version_group_name === a.version_group.name) {
					return a.language.name === this.secondaryLanguageCode;
				}
				return false;
			} else {
				return a.language.name === this.secondaryLanguageCode;
			}
		})[0];

		const typeSprite = Types.filter(a => a.english_id === moveData.type.name)[0].sprite;
		const type = typeSprite.split("/")[4].split(".")[0];

		let damageClassSprite = "";
		if (moveData.damage_class.name === "special")
			damageClassSprite = "/static/assets/attack-types/special.png";
		else if (moveData.damage_class.name === "physical")
			damageClassSprite = "/static/assets/attack-types/physical.png";
		else if (moveData.damage_class.name === "status")
			damageClassSprite = "/static/assets/attack-types/status.png";
		const damageClass = damageClassSprite.split("/")[4].split(".")[0];

		const tmEntries: { game: string; gameDisplay: string; name: string; id: number }[] =
			[];
		machineData.forEach(a => {
			const games = Games.findEntry(a.version_group.name);
			const gameNames = games.consistsOf.map(a => a[0].toUpperCase() + a.slice(1));
			tmEntries.push({
				game: games.version_group_name,
				gameDisplay: gameNames.join(" "),
				name: a.item.name.toUpperCase(),
				id: parseInt(a.item.url.split("/")[6]),
			});
		});

		const pokemon: PokemonName[] = [];
		moveData.learned_by_pokemon.forEach(a => {
			const id = a.url.split("/")[6];
			const details = this.data.findPokemonNameFromId(parseInt(id));

			if (details) {
				pokemon.push(details);
			}
		});

		return {
			primaryLanguage: primaryLang,
			secondaryLanguage: secondaryLang,
			damageClass: damageClass[0].toUpperCase() + damageClass.slice(1),
			damageClassSprite: damageClassSprite,
			type: type[0].toUpperCase() + type.slice(1),
			typeSprite: typeSprite,
			effectEntry: primaryLangEffect
				? primaryLangEffect
				: secondaryLangEffect
				? secondaryLangEffect
				: "No Data",
			flavorEntry: primaryFlavorText
				? primaryFlavorText.flavor_text
				: secondaryFlavorText
				? secondaryFlavorText.flavor_text
				: "No data",
			secondaryLangEffect: secondaryLangEffect,
			accuracy: moveData.accuracy ? moveData.accuracy : "-",
			power: moveData.power ? moveData.power : "-",
			pp: moveData.pp ? moveData.pp : "-",
			priority: moveData.priority,
			tm: tmEntries,
			generation: moveData.generation.name.split("-")[1],
			pokemon: pokemon,
		};
	};

	getSearchResults = async (
		searchTerm: string,
		pokemon: boolean,
		items: boolean,
		moves: boolean,
		abilities: boolean
	): Promise<Collection> => {
		const pkmnResults = pokemon ? this.data.findPokemonFromName(searchTerm) : [];
		const itemResults = items ? this.data.findItemFromName(searchTerm) : [];
		const moveResults = moves ? this.data.findMoveFromName(searchTerm) : [];
		const abilityResults = abilities ? this.data.findAbilityFromName(searchTerm) : [];

		return {
			Pokemon: pkmnResults.slice(0, appSettings.maxSearchResults),
			Items: itemResults.slice(0, appSettings.maxSearchResults),
			Moves: moveResults.slice(0, appSettings.maxSearchResults),
			Abilities: abilityResults.slice(0, appSettings.maxSearchResults),
		};
	};

	getAbility = async (id: number, game?: string) => {
		const ability = await this.data.getAbility(id);

		const primaryLang = Utils.findNameFromLanguageCode(
			ability.names,
			this.primaryLanguageCode
		);
		const secondaryLang = Utils.findNameFromLanguageCode(
			ability.names,
			this.secondaryLanguageCode
		);

		let pokemon: PokemonName[] = [];
		ability.pokemon.forEach(a => {
			const id = a.pokemon.url.split("/")[6];
			const details = this.data.findPokemonNameFromId(parseInt(id));

			if (details) {
				pokemon.push(details);
			}
		});

		const primaryFlavorText = ability.flavor_text_entries.filter(
			a => a.language.name === this.primaryLanguageCode
		)[0];
		const secondaryFlavorText = ability.flavor_text_entries.filter(
			a => a.language.name === this.secondaryLanguageCode
		)[0];

		const foundGame = Games.findEntry(game ? game : "");
		const gameParts = foundGame.consistsOf.map(a => a[0].toUpperCase() + a.slice(1));
		const gameString = gameParts.join(" / ").replace(/-/g, " ");

		let primaryLangEffectEntry = ability.effect_entries.filter(
			a => a.language.name === this.primaryLanguageCode
		)[0];
		let secondaryLangEffectEntry = ability.effect_entries.filter(
			a => a.language.name === this.secondaryLanguageCode
		)[0];

		const generationChange: { text: string; altEntryEffect: string }[] = [];

		const selectedId = Games.generationOrder.indexOf(foundGame.generation);
		ability.effect_changes.forEach(change => {
			const changeGame = Games.findEntry(change.version_group.name);
			const changeGenerationId = Games.generationOrder.indexOf(changeGame.generation);

			let primary = "";
			let secondary = "";
			change.effect_entries.forEach(a => {
				if (a.language.name === this.primaryLanguageCode) primary = a.effect;
				else if (a.language.name === this.secondaryLanguageCode) secondary = a.effect;
			});

			if (selectedId < changeGenerationId) {
				generationChange.push({
					text: `Behaviour after generation ${changeGame.generation}`,
					altEntryEffect: primaryLangEffectEntry
						? primaryLangEffectEntry.short_effect
						: secondaryLangEffectEntry.short_effect,
				});

				// Use the old entry
				primaryLangEffectEntry = change.effect_entries.filter(a => {
					a.language.name === this.primaryLanguageCode;
				})[0];
				secondaryLangEffectEntry = ability.effect_entries.filter(
					a => a.language.name === this.secondaryLanguageCode
				)[0];
			} else {
				generationChange.push({
					text: `Effect before generation ${changeGame.generation}:`,
					altEntryEffect: primary ? primary : secondary,
				});
			}
		});

		const abilitySelectedId = Games.generationOrder.indexOf(
			ability.generation.name.split("-")[1]
		);

		if (selectedId >= 0 && selectedId < abilitySelectedId && primaryLangEffectEntry) {
			primaryLangEffectEntry = {
				effect: primaryLangEffectEntry.effect,
				language: { name: this.primaryLanguageCode },
				short_effect: "This ability did not exist in this game yet",
			};
		}

		let effectEntry = "No entry found";
		if (primaryLangEffectEntry && primaryLangEffectEntry.short_effect)
			effectEntry = primaryLangEffectEntry.short_effect;
		else if (secondaryLangEffectEntry && secondaryLangEffectEntry.short_effect)
			effectEntry = secondaryLangEffectEntry.short_effect;

		return {
			primaryLanguage: primaryLang,
			secondaryLanguage: secondaryLang,
			game: gameString === "All" ? "" : gameString,
			effectEntry: effectEntry,
			flavorText: primaryFlavorText
				? primaryFlavorText.flavor_text
				: secondaryFlavorText
				? secondaryFlavorText.flavor_text
				: "No data",
			introduced: ability.generation.name.split("-")[1],
			generationChange: generationChange,
			pokemon: pokemon,
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

	processMoveset = (
		moves: APIResponsePokemon["moves"],
		versionGroup: VersionGroup
	): MoveDetails[] => {
		const levelMoves: MoveDetails[] = [];
		const tmMoves: MoveDetails[] = [];
		const eggMoves: MoveDetails[] = [];
		const tutorMoves: MoveDetails[] = [];

		const legacyDamageClassGenerations = ["i", "ii", "iii"];
		const legacyPhysicalTypes = [
			"normal",
			"fighting",
			"poison",
			"gorund",
			"flying",
			"bug",
			"rock",
			"ghost",
			"steel",
		];
		const legacySpecialTypes = [
			"fire",
			"water",
			"electric",
			"grass",
			"ice",
			"physic",
			"dragon",
			"dark",
		];

		moves.forEach(move => {
			move.version_group_details.forEach(version => {
				const foundVersion = Games.findEntry(version.version_group.name);
				if (foundVersion.version_group_name !== versionGroup.version_group_name) return;

				const moveDetail = Moves.find(a => a.english_id === move.move.name);
				if (!moveDetail) return;

				// Only physical and special types were different in Gen 1-3
				if (
					legacyDamageClassGenerations.includes(foundVersion.generation) &&
					moveDetail.attack_type !== "status"
				) {
					if (legacyPhysicalTypes.includes(moveDetail.type)) {
						moveDetail.attack_type = "physical";
					} else if (legacySpecialTypes.includes(moveDetail.type)) {
						moveDetail.attack_type = "special";
					}
				}

				let primaryName = "";
				let secondaryName = "";
				moveDetail.names.forEach(b => {
					for (const [key, value] of Object.entries(b)) {
						if (key === this.primaryLanguageCode) primaryName = value;
						else if (key === this.secondaryLanguageCode) secondaryName = value;
					}
				});

				const completeMove = {
					...moveDetail,
					learning_method: version.move_learn_method.name,
					level_learnt: version.level_learned_at,
					type_sprite: this.data.typeSprite(moveDetail.type),
					attack_type_sprite: this.data.attackSprite(moveDetail.attack_type),
					primaryLanguage: primaryName,
					secondaryLanguage: secondaryName,
					link: `/move/${moveDetail.id}`,
				};

				if (completeMove.learning_method === "level-up") {
					levelMoves.push(completeMove);
				}

				if (completeMove.learning_method === "egg") {
					eggMoves.push(completeMove);
				}

				if (completeMove.learning_method === "machine") {
					tmMoves.push(completeMove);
				}

				if (completeMove.learning_method === "tutor") {
					tutorMoves.push(completeMove);
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
