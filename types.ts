export class Games {
	static generationOrder = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"];
	static names = [
		{
			version_group_name: "all",
			consistsOf: ["all"],
			generation: "",
		},
		{
			version_group_name: "red-blue",
			consistsOf: ["red", "blue"],
			generation: "i",
		},
		{
			version_group_name: "yellow",
			consistsOf: ["yellow"],
			generation: "i",
		},
		{
			version_group_name: "gold-silver",
			consistsOf: ["gold", "silver"],
			generation: "ii",
		},
		{
			version_group_name: "crystal",
			consistsOf: ["crystal"],
			generation: "ii",
		},
		{
			version_group_name: "ruby-sapphire",
			consistsOf: ["ruby", "sapphire"],
			generation: "iii",
		},
		{
			version_group_name: "emerald",
			consistsOf: ["emerald"],
			generation: "iii",
		},
		{
			version_group_name: "firered-leafgreen",
			consistsOf: ["firered", "leafgreen"],
			generation: "iii",
		},
		{
			version_group_name: "diamond-pearl",
			consistsOf: ["diamond", "pearl"],
			generation: "iv",
		},
		{
			version_group_name: "platinum",
			consistsOf: ["platinum"],
			generation: "iv",
		},
		{
			version_group_name: "heartgold-soulsilver",
			consistsOf: ["heartgold", "soulsilver"],
			generation: "iv",
		},
		{
			version_group_name: "black-white",
			consistsOf: ["black", "white"],
			generation: "v",
		},
		{
			version_group_name: "colosseum",
			consistsOf: ["colosseum"],
			generation: "iv",
		},
		{
			version_group_name: "xd",
			consistsOf: ["xd"],
			generation: "iv",
		},
		{
			version_group_name: "black-2-white-2",
			consistsOf: ["black-2", "white-2"],
			generation: "v",
		},
		{
			version_group_name: "x-y",
			consistsOf: ["x", "y"],
			generation: "vi",
		},
		{
			version_group_name: "omega-ruby-alpha-sapphire",
			consistsOf: ["omega-ruby", "alpha-sapphire"],
			generation: "vi",
		},
		{
			version_group_name: "sun-moon",
			consistsOf: ["sun", "moon"],
			generation: "vii",
		},
		{
			version_group_name: "ultra-sun-ultra-moon",
			consistsOf: ["ultra-sun", "ultra-moon"],
			generation: "vii",
		},
		{
			version_group_name: "lets-go-pikachu-lets-go-eevee",
			consistsOf: ["lets-go-pikachu", "lets-go-eevee"],
			generation: "vii",
		},
		{
			version_group_name: "sword-shield",
			consistsOf: ["sword", "shield"],
			generation: "viii",
		},
		{
			version_group_name: "brilliant-diamond-and-shining-pearl",
			consistsOf: ["brilliant-diamond", "shining-pearl"],
			generation: "viii",
		},
		{
			version_group_name: "legends-arceus",
			consistsOf: ["legends-arceus"],
			generation: "viii",
		},
		{
			version_group_name: "scarlet-violet",
			consistsOf: ["scarlet", "violet"],
			generation: "ix",
		},
	];

	static findEntry = (game: string): VersionGroup => {
		const result = this.names.find(
			a => a.version_group_name === game || a.consistsOf.includes(game)
		);

		return result
			? result
			: { version_group_name: "all", consistsOf: [], generation: "all" };
	};
}

export interface VersionGroup {
	version_group_name: string;
	consistsOf: string[];
	generation: string;
}

export interface ErrorMessage {
	error: string;
	info: string;
}

export interface GenericEntry {
	german: string;
	english: string;
	english_id: string;
	id: number;
	link: string;
	sprite: string;
}

export interface MoveEntry extends GenericEntry {
	attack_type: string;
	attack_type_sprite: string;
	type: string;
	type_sprite: string;
}

export interface PokemonName {
	german: string;
	english: string;
	id: number;
	link: string;
	sprite: string;
}

interface GenericResult {
	german: string;
	english: string;
	id: number;
}

export interface Collection {
	Abilities?: GenericResult[];
	Items?: GenericResult[];
	Moves?: MoveEntry[];
	Types?: GenericResult[];
	Pokemon?: PokemonName[];
}

export interface MoveDetails {
	german: string;
	english: string;
	link: string;
	attack_type: string;
	attack_type_sprite: string;
	type: string;
	type_sprite: string;
	learning_method: "level-up" | "machine" | "tutor" | "egg";
	level_learnt: number;
}

export interface Evolution {
	sourceURL: string;
	sourceSprite: string;
	trigger: string;
	requirements: {
		type: string;
		info: string;
		supplementary?: string;
	}[];
	targetURL: string;
	targetSprite: string;
}
export interface PokemonDetails {
	german: string;
	english: string;
	id: number;
	link: string;
	types: {
		name: string;
		sprite: string;
	}[];
	forms: {
		name: string;
		sprites: GenericSprites;
		url: string;
	}[];
	sprites: GenericSprites;
	captureRate: number;
	growthRate: string;
	evolutions: Evolution[];
	pokedex?: {
		game: string;
		entry: string;
	}[];
	weight: number;
	height: number;
	abilities: {
		name: string;
		effect: string;
		isHidden: boolean;
		link: string;
	}[];
	moveset: MoveDetails[];
	baseStats: {
		hp: any;
		attack: any;
		defense: any;
		special_attack: any;
		special_defense: any;
		speed: any;
	};
	selectedGames: VersionGroup | undefined;
}

export interface APIResponseForm {
	form_names: {
		language: {
			name: string;
		};
		name: string;
	}[];
	sprites: SpriteForm;
}

export interface APIResponseItem {
	name: string;
	id: number;
	cost: number;
	names: {
		language: {
			name: string;
		};
		name: string;
	}[];
	effect_entries: {
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
		version: {
			name: string;
		};
	}[];
	sprites: {
		default: string;
	};
}

export interface SpriteForm {
	front_default: string;
	front_shiny: string;
	front_female: string;
	front_shiny_female: string;
}

export interface APIResponsePokemon {
	id: number;
	weight: number;
	height: number;
	abilities: {
		ability: {
			name: string;
			url: string;
		};
		is_hidden: boolean;
	}[];
	forms: {
		name: string;
		url: string;
	}[];
	moves: {
		move: {
			name: string;
			url: string;
		};
		version_group_details: {
			level_learned_at: number;
			move_learn_method: {
				name: "level-up" | "machine" | "tutor" | "egg";
				url: string;
			};
			version_group: {
				name: string;
				url: string;
			};
		}[];
	}[];
	types: {
		type: {
			name: string;
		};
	}[];
	past_types: {
		generation: {
			name: string;
		};
		types: {
			type: {
				name: string;
			};
		}[];
	}[];
	stats: {
		base_stat: number;
		effort: number;
		stat: {
			name: string;
		};
	}[];
	sprites: Sprites;
}

export interface Sprites {
	back_default: string;
	back_shiny: string;
	front_default: string;
	front_shiny: string;
	other: {
		home: {
			front_default: string;
			front_female: string;
			front_shiny: string;
			front_shiny_female: string;
		};
		"official-artwork": {
			front_default: string;
			front_shiny: string;
		};
	};
	versions: {
		"generation-i": {
			"red-blue": {
				back_default: string;
				back_gray: string;
				back_transparent: string;
				front_default: string;
				front_gray: string;
				front_transparent: string;
			};
			yellow: {
				back_default: string;
				back_gray: string;
				back_transparent: string;
				front_default: string;
				front_gray: string;
				front_transparent: string;
			};
		};
		"generation-ii": {
			crystal: {
				back_default: string;
				back_shiny: string;
				back_shiny_transparent: string;
				back_transparent: string;
				front_default: string;
				front_shiny: string;
				front_shiny_transparent: string;
				front_transparent: string;
			};
			gold: {
				back_default: string;
				back_shiny: string;
				front_default: string;
				front_shiny: string;
				front_transparent: string;
			};
			silver: {
				back_default: string;
				back_shiny: string;
				front_default: string;
				front_shiny: string;
				front_transparent: string;
			};
		};
		"generation-iii": {
			emerald: { front_default: string; front_shiny: string };
			"firered-leafgreen": {
				back_default: string;
				back_shiny: string;
				front_default: string;
				front_shiny: string;
			};
			"ruby-sapphire": {
				back_default: string;
				back_shiny: string;
				front_default: string;
				front_shiny: string;
			};
		};
		"generation-iv": {
			"diamond-pearl": {
				back_default: string;
				back_female: string;
				back_shiny: string;
				back_shiny_female: string;
				front_default: string;
				front_female: string;
				front_shiny: string;
				front_shiny_female: string;
			};
			"heartgold-soulsilver": {
				back_default: string;
				back_female: string;
				back_shiny: string;
				back_shiny_female: string;
				front_default: string;
				front_female: string;
				front_shiny: string;
				front_shiny_female: string;
			};
			platinum: {
				back_default: string;
				back_female: string;
				back_shiny: string;
				back_shiny_female: string;
				front_default: string;
				front_female: string;
				front_shiny: string;
				front_shiny_female: string;
			};
		};
		"generation-v": {
			"black-white": {
				animated: {
					back_default: string;
					back_female: string;
					back_shiny: string;
					back_shiny_female: string;
					front_default: string;
					front_female: string;
					front_shiny: string;
					front_shiny_female: string;
				};
				back_default: string;
				back_female: string;
				back_shiny: string;
				back_shiny_female: string;
				front_default: string;
				front_female: string;
				front_shiny: string;
				front_shiny_female: string;
			};
		};
		"generation-vi": {
			"omegaruby-alphasapphire": {
				front_default: string;
				front_female: string;
				front_shiny: string;
				front_shiny_female: string;
			};
			"x-y": {
				front_default: string;
				front_female: string;
				front_shiny: string;
				front_shiny_female: string;
			};
		};
		"generation-vii": {
			icons: {
				front_default: string;
				front_female: string;
			};
			"ultra-sun-ultra-moon": {
				front_default: string;
				front_female: string;
				front_shiny: string;
				front_shiny_female: string;
			};
		};
		"generation-viii": {
			icons: {
				front_default: string;
				front_female: string;
			};
		};
	};
}

export interface GenericSprites {
	primary: string;
	secondary: string;
	shiny: string;
}
export interface APIResponseAbility {
	name: string;
	names: {
		language: {
			name: string;
		};
		name: string;
	}[];
	id: string;
	effect_entries: {
		short_effect: string;
		language: {
			name: string;
		};
	}[];
}

export interface APIResponseSpecies {
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
	varieties: {
		is_default: boolean;
		pokemon: {
			name: string;
			url: string;
		};
	}[];
	has_gender_differences: boolean;
}

export interface EvolutionChain {
	species: {
		name: string;
		url: string;
	};
	evolution_details: {
		gender: string;
		held_item: {
			name: string;
			url: string;
		};
		item: {
			name: string;
			url: string;
		};
		known_move: {
			name: string;
			url: string;
		};
		known_move_type: {
			name: string;
			url: string;
		};
		location: {
			name: string;
			url: string;
		};
		min_affection: string;
		min_beauty: string;
		min_happiness: string;
		min_level: number;
		needs_overworld_rain: boolean;
		party_species: {
			name: string;
			url: string;
		};
		party_type: {
			name: string;
		};
		relative_physical_stats: number;
		time_of_day: string;
		trade_species: {
			name: string;
			url: string;
		};
		turn_upside_down: boolean;
		trigger: {
			name: string;
			url: string;
		};
	}[];
	evolves_to: EvolutionChain[];
}
export interface APIResponseEvolution {
	chain: EvolutionChain;
}
