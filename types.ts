export interface GenericEntry {
	german: string;
	english: string;
	english_id: string;
	id: number;
	link: string;
	sprite: string;
}

export interface Moves extends GenericEntry {
	attack_type: "physical" | "special" | "status";
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

export interface Collection {
	Abilities?: GenericEntry[];
	Items?: GenericEntry[];
	Moves?: Moves[];
	Types?: GenericEntry[];
	Pokemon?: PokemonName[];
}

export interface MoveDetails {
	german: string;
	english: string;
	link: string;
	attack_type: "physical" | "special" | "status";
	attack_type_sprite: string;
	type: string;
	type_sprite: string;
	learning_method: string;
	level_learnt: number;
}
export interface PokemonDetails extends PokemonName {
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
	selectedGames: string[];
}

export interface APIResponsePokemon {
	weight: number;
	height: number;
	abilities: {
		ability: {
			name: string;
			url: string;
		};
		is_hidden: boolean;
	}[];
	moves: {
		move: {
			name: string;
			url: string;
		};
		version_group_details: {
			level_learned_at: number;
			move_learn_method: {
				name: string;
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
	stats: {
		base_stat: number;
		effort: number;
		stat: {
			name: string;
		};
	}[];
	sprites: {
		back_default: string;
		back_shiny: string;
		front_default: string;
		front_shiny: string;
	};
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
}

export interface APIResponseEvolution {
	id: number;
}
