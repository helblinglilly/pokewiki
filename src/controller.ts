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
	PokemonName,
	APIResponseMachine,
} from "./types";
import { appSettings } from "../api/app";

class Controller {
	data: Data;

	constructor() {
		this.data = new Data();
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
		let [primName, secName] = Utils.getNamesFromGeneric(speciesData.names);

		let showcaseSprites = Utils.getPokemonSprite(
			pokemonData.sprites,
			"full",
			"default",
			game
		);

		// Abilities
		const abilities = abilitiesData.map(entry => {
			const pkmnAbility = pokemonData.abilities.find(a => a.ability.name === entry.name);
			const [primaryName, secondaryName] = Utils.getNamesFromGeneric(entry.names);
			const isHidden = pkmnAbility && pkmnAbility.is_hidden ? true : false;

			let primaryEffectEntry = entry.effect_entries.find(
				a => a.language.name === appSettings.primaryLanguageCode
			);
			const secondaryEffectEntry = entry.effect_entries.find(
				a => a.language.name === appSettings.secondaryLanguageCode
			);
			if (!primaryEffectEntry && !secondaryEffectEntry) {
				primaryEffectEntry = entry.effect_entries.find(a => a.language.name === "en");
			}

			return {
				name: primaryName ? primaryName : secondaryName ? secondaryName : entry.name,
				effect: primaryEffectEntry
					? primaryEffectEntry.short_effect
					: secondaryEffectEntry
					? secondaryEffectEntry.short_effect
					: "No data",
				isHidden: isHidden,
				link: `/ability/${entry.id}`,
			};
		});

		// Types
		let types: { name: string; sprite: string }[] = [];
		pokemonData.types.forEach(pokeType => {
			const lookupType = Types.find(a => a.name === pokeType.type.name);
			types.push({
				name: lookupType ? lookupType.name : "?",
				sprite: lookupType
					? this.data.typeSprite(lookupType.name)
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
			let name = primName ? primName : secName ? secName : "";

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
					if (entry.language.name === appSettings.primaryLanguageCode) {
						pokedexEntries.push({
							game: entry.version.name.replace(new RegExp("-", "g"), " "),
							entry: entry.flavor_text,
						});
					} else if (entry.language.name === appSettings.secondaryLanguageCode) {
						pokedexEntries.push({
							game: entry.version.name.replace(new RegExp("-", "g"), " "),
							entry: entry.flavor_text,
						});
					}
				}
			});

			if (pokedexEntries.length === 0 && !Utils.isEnglishSelected()) {
				speciesData.flavor_text_entries.forEach(entry => {
					if (selectedGames.consistsOf.includes(entry.version.name)) {
						if (entry.language.name === "en") {
							pokedexEntries.push({
								game: entry.version.name.replace(new RegExp("-", "g"), " "),
								entry: entry.flavor_text,
							});
						}
					}
				});
			}

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
								if (allType.name === oldType.type.name) {
									oldTypes.push({
										name: allType.name,
										sprite: this.data.typeSprite(allType.name),
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

		// Type relations
		const defensiveTyping = Utils.getTypeRelations(types, selectedGames?.generation);

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

		if (id === 922 || id === 923) {
			// Pawmo to Pamamo
			evolutions.pop();
			evolutions.push({
				sourceURL: `/pokemon/922`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/922.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Level up after 1000 steps in Let's Go mode",
					},
				],
				targetURL: `/pokemon/923`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/923.png`,
			});
		}

		if (id === 924 || id === 925) {
			// Tandemaus
			evolutions.pop();
			evolutions.push({
				sourceURL: `/pokemon/924`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/924.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Level 25 - Free spot in party",
					},
				],
				targetURL: `/pokemon/925`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/925.png`,
			});
		}

		if (id === 946 || id === 947) {
			// Bramblin to Brambleghast
			evolutions.pop();
			evolutions.push({
				sourceURL: `/pokemon/946`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/946.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Level up after 1000 steps in Let's Go mode",
					},
				],
				targetURL: `/pokemon/947`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/947.png`,
			});
		}

		if (id === 963 || id === 964) {
			// Finizen to Palafin
			evolutions.pop();
			evolutions.push({
				sourceURL: `/pokemon/963`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/963.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Level 38 + Level up in multiplayer session",
					},
				],
				targetURL: `/pokemon/964`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/964.png`,
			});
		}

		if (id === 57 || id === 979) {
			// Primeape to Annihilape
			evolutions.pop();
			evolutions.push({
				sourceURL: `/pokemon/57`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/57.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Level 35, Use Rage Fist 20x in a row - No Pokécentre",
					},
				],
				targetURL: `/pokemon/979`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/979.png`,
			});
		}

		if (id === 625 || id === 983) {
			// Bisharp to Kingambit
			evolutions.pop();
			evolutions.push({
				sourceURL: `/pokemon/625`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/625.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "First in Party, Find 3x other Bisharp that travel with Pawinards",
					},
				],
				targetURL: `/pokemon/983`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/983.png`,
			});
		}

		if (id === 999 || id === 1000) {
			// Gimmighoul into Gholdengo
			evolutions.pop();
			evolutions.push({
				sourceURL: `/pokemon/999`,
				sourceSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/999.png`,
				trigger: "other",
				requirements: [
					{
						type: "other",
						info: "Level up with 999 Gimmighoul Coins in possession",
					},
				],
				targetURL: `/pokemon/1000`,
				targetSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1000.png`,
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
			defensiveTyping: defensiveTyping,
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

		let [primaryLangName, secondaryLangName] = Utils.getNamesFromGeneric(itemData.names);

		let previousItemName = "";
		let previousItemSprite = appSettings.placeholderImage;
		let nextItemSprite = appSettings.placeholderImage;

		if (previousItemData) {
			const [primaryPrevItemName, secondaryPrevItemName] = Utils.getNamesFromGeneric(
				previousItemData.names
			);
			previousItemName = primaryPrevItemName
				? primaryPrevItemName
				: secondaryPrevItemName;
			previousItemSprite = previousItemData.sprites.default;
		}

		let nextItemName = "";
		if (nextItemData) {
			const [primaryNextItemName, secondaryNextItemName] = Utils.getNamesFromGeneric(
				nextItemData.names
			);
			nextItemName = primaryNextItemName ? primaryNextItemName : secondaryNextItemName;
			nextItemSprite = nextItemData.sprites.default;
		}

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

		itemData.effect_entries.forEach((entry, i) => {
			if (entry.language.name === appSettings.primaryLanguageCode) {
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

						if (entry.language.name === appSettings.primaryLanguageCode) {
							primaryLangText = entry.text;
						} else if (entry.language.name === appSettings.secondaryLanguageCode) {
							secondaryLangText = entry.text;
						}

						const game = foundGame.consistsOf.map(a => a[0].toUpperCase() + a.slice(1));
						secondaryEntry.game = game.join(" / ").replace(/-/g, " ");
					}
				});

				if (!primaryLangText && !secondaryLangText && !Utils.isEnglishSelected()) {
					itemData.flavor_text_entries.forEach(entry => {
						if (foundGame.version_group_name === entry.version_group.name) {
							if (entry.language.name === "en") {
								primaryLangText = entry.text;
							}
							const game = foundGame.consistsOf.map(a => a[0].toUpperCase() + a.slice(1));
							secondaryEntry.game = game.join(" / ").replace(/-/g, " ");
						}
					});
				}

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
							appSettings.primaryLanguageCode
						);
						secondaryEntry.clickable.state = true;
						secondaryEntry.clickable.url = `/move/${moveId}`;

						primaryLangName += ` ${secondaryEntry.entry}`;
						secondaryLangName = Utils.findNameFromLanguageCode(
							moveData.names,
							appSettings.secondaryLanguageCode
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

		const [primaryLang, secondaryLang] = Utils.getNamesFromGeneric(moveData.names);

		let primaryLangEffect = moveData.effect_entries.filter(
			a => a.language.name === appSettings.primaryLanguageCode
		)[0]?.short_effect;
		let secondaryLangEffect = moveData.effect_entries.filter(
			a => a.language.name === appSettings.secondaryLanguageCode
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

		if (!primaryLangEffect && !secondaryLangEffect && !Utils.isEnglishSelected()) {
			primaryLangEffect = moveData.effect_entries.filter(a => a.language.name === "en")[0]
				?.short_effect;

			if (moveData.effect_chance) {
				primaryLangEffect = primaryLangEffect.replace(
					"$effect_chance",
					moveData.effect_chance.toString()
				);
			}
		}

		let primaryFlavorText = moveData.flavor_text_entries.filter(a => {
			if (game) {
				const gameEntry = Games.findEntry(game);
				if (gameEntry.version_group_name === a.version_group.name) {
					return a.language.name === appSettings.primaryLanguageCode;
				}
				return false;
			} else {
				return a.language.name === appSettings.primaryLanguageCode;
			}
		})[0];
		let secondaryFlavorText = moveData.flavor_text_entries.filter(a => {
			if (game) {
				const gameEntry = Games.findEntry(game);
				if (gameEntry.version_group_name === a.version_group.name) {
					return a.language.name === appSettings.secondaryLanguageCode;
				}
				return false;
			} else {
				return a.language.name === appSettings.secondaryLanguageCode;
			}
		})[0];

		if (!primaryFlavorText && !secondaryFlavorText && !Utils.isEnglishSelected()) {
			primaryFlavorText = moveData.flavor_text_entries.filter(a => {
				if (game) {
					const gameEntry = Games.findEntry(game);
					if (gameEntry.version_group_name === a.version_group.name) {
						return a.language.name === "en";
					}
					return false;
				} else {
					return a.language.name === "en";
				}
			})[0];
		}

		const typeSprite = Types.filter(a => a.name === moveData.type.name)[0].sprite;
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
		let isNumber = !isNaN(parseInt(searchTerm));

		const pkmnResults = pokemon ? this.data.findPokemonFromName(searchTerm) : [];
		const itemResults = items && !isNumber ? this.data.findItemFromName(searchTerm) : [];
		const moveResults = moves && !isNumber ? this.data.findMoveFromName(searchTerm) : [];
		const abilityResults =
			abilities && !isNumber ? this.data.findAbilityFromName(searchTerm) : [];

		return {
			Pokemon: pkmnResults,
			Items: itemResults,
			Moves: moveResults,
			Abilities: abilityResults,
		};
	};

	getAbility = async (id: number, game?: string) => {
		const ability = await this.data.getAbility(id);

		const [primaryLang, secondaryLang] = Utils.getNamesFromGeneric(ability.names);

		let pokemon: PokemonName[] = [];
		ability.pokemon.forEach(a => {
			const id = a.pokemon.url.split("/")[6];
			const details = this.data.findPokemonNameFromId(parseInt(id));

			if (details) {
				pokemon.push(details);
			}
		});

		let primaryFlavorText = ability.flavor_text_entries.filter(
			a => a.language.name === appSettings.primaryLanguageCode
		)[0];
		const secondaryFlavorText = ability.flavor_text_entries.filter(
			a => a.language.name === appSettings.secondaryLanguageCode
		)[0];

		if (!primaryFlavorText && !secondaryFlavorText && !Utils.isEnglishSelected()) {
			primaryFlavorText = ability.flavor_text_entries.filter(
				a => a.language.name === "en"
			)[0];
		}

		const foundGame = Games.findEntry(game ? game : "");
		const gameParts = foundGame.consistsOf.map(a => a[0].toUpperCase() + a.slice(1));
		const gameString = gameParts.join(" / ").replace(/-/g, " ");

		let primaryLangEffectEntry = ability.effect_entries.filter(
			a => a.language.name === appSettings.primaryLanguageCode
		)[0];
		let secondaryLangEffectEntry = ability.effect_entries.filter(
			a => a.language.name === appSettings.secondaryLanguageCode
		)[0];
		if (
			!primaryLangEffectEntry &&
			!secondaryLangEffectEntry &&
			!Utils.isEnglishSelected()
		) {
			primaryLangEffectEntry = ability.effect_entries.filter(
				a => a.language.name === "en"
			)[0];
		}

		const generationChange: { text: string; altEntryEffect: string }[] = [];

		const selectedId = Games.generationOrder.indexOf(foundGame.generation);
		ability.effect_changes.forEach(change => {
			const changeGame = Games.findEntry(change.version_group.name);
			const changeGenerationId = Games.generationOrder.indexOf(changeGame.generation);

			let primary = "";
			let secondary = "";
			change.effect_entries.forEach(a => {
				if (a.language.name === appSettings.primaryLanguageCode) primary = a.effect;
				else if (a.language.name === appSettings.secondaryLanguageCode)
					secondary = a.effect;
			});
			if (!primary && !secondary && !Utils.isEnglishSelected()) {
				change.effect_entries.forEach(a => {
					if (a.language.name === "en") primary = a.effect;
				});
			}

			if (selectedId < changeGenerationId) {
				generationChange.push({
					text: `Behaviour after generation ${changeGame.generation}`,
					altEntryEffect: primaryLangEffectEntry
						? primaryLangEffectEntry.short_effect
						: secondaryLangEffectEntry
						? secondaryLangEffectEntry.short_effect
						: "No data",
				});

				// Use the old entry
				primaryLangEffectEntry = change.effect_entries.filter(a => {
					a.language.name === appSettings.primaryLanguageCode;
				})[0];
				secondaryLangEffectEntry = ability.effect_entries.filter(
					a => a.language.name === appSettings.secondaryLanguageCode
				)[0];
				if (
					!primaryLangEffectEntry &&
					!secondaryLangEffectEntry &&
					!Utils.isEnglishSelected()
				) {
					primaryLangEffectEntry = ability.effect_entries.filter(
						a => a.language.name === "en"
					)[0];
				}
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
				language: { name: appSettings.primaryLanguageCode },
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

	getRandomPokemon = () => {
		const id = Utils.randomDailyNumber(appSettings.highestPokedexId)[
			Utils.daysPassedInYear()
		];
		const data = this.data.findPokemonNameFromId(id);

		return {
			primaryLang: data?.primaryLang,
			secondaryLang: data?.secondaryLang,
			link: data?.link,
			sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
			id: id,
		};
	};

	getRandomMove = async () => {
		const id = Utils.randomDailyNumber(appSettings.highestMoveId)[
			Utils.daysPassedInYear()
		];
		const data = await this.data.getMove(id);

		let primaryName = Utils.findNameFromLanguageCode(
			data.names,
			appSettings.primaryLanguageCode
		);
		let secondaryName = Utils.findNameFromLanguageCode(
			data.names,
			appSettings.secondaryLanguageCode
		);

		if (primaryName.length === 0 && secondaryName.length === 0) {
			primaryName = Utils.findNameFromLanguageCode(data.names, "en");
		}

		return {
			primaryLang: primaryName,
			secondaryLang: secondaryName,
			link: `/move/${id}`,
		};
	};

	getRandomAbility = async () => {
		const id = Utils.randomDailyNumber(appSettings.highestAbilityId)[
			Utils.daysPassedInYear()
		];
		const data = await this.data.getAbility(id);

		let primaryName = Utils.findNameFromLanguageCode(
			data.names,
			appSettings.primaryLanguageCode
		);
		let secondaryName = Utils.findNameFromLanguageCode(
			data.names,
			appSettings.secondaryLanguageCode
		);

		if (primaryName.length === 0 && secondaryName.length === 0) {
			primaryName = Utils.findNameFromLanguageCode(data.names, "en");
		}

		return {
			primaryLang: primaryName,
			secondaryLang: secondaryName,
			link: `/ability/${id}`,
		};
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
						if (key === appSettings.primaryLanguageCode) primaryName = value;
						else if (key === appSettings.secondaryLanguageCode) secondaryName = value;
					}
				});

				if (!primaryName && !secondaryName && !Utils.isEnglishSelected()) {
					moveDetail.names.forEach(b => {
						for (const [key, value] of Object.entries(b)) {
							if (key === "en") primaryName = value;
						}
					});
				}

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
