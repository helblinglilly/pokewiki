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

	static getPokemon = async (searchTerm?: string): Promise<PokemonName[]> => {
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

	static getSearchResults = async (
		searchTerm: string
	): Promise<Collection> => {
		return Promise.all([
			this.getGeneric("abilities.json", searchTerm),
			this.getGeneric("items.json", searchTerm),
			this.getGeneric("moves.json", searchTerm),
			this.getPokemon(searchTerm),
		]).then((values) => {
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
