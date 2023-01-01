import axios from "axios";
import log from "./log";
import { host, port } from "./api/app";

const searchLimit = 10;

interface GenericEntry {
	german: string;
	english: string;
	english_id: string;
	id: number;
}

interface Moves extends GenericEntry {
	attack_type: "physical" | "special" | "status";
}

interface Types extends GenericEntry {
	sprite: string;
}

interface PokemonName {
	german: string;
	english: string;
	id: number;
}

interface Collection {
	Abilities?: GenericEntry[];
	Items?: GenericEntry[];
	Moves?: Moves[];
	Types?: Types[];
	Pokemon?: PokemonName[];
}

class Model {
	static getGeneric = async (
		location: string,
		searchTerm?: string
	): Promise<GenericEntry[]> => {
		let entries: GenericEntry[] = [];
		try {
			const result = await axios.get(`${host}:${port}${location}`);
			entries = result.data;
		} catch (error) {
			log.error(
				`Failed to fetch ${host}:${port}${location} with error ${error}`
			);
		}

		log.debug(
			`Retrieved ${entries.length} amount of entries for ${location}`
		);

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
				`${host}:${port}/static/pokedata/pokemon.json`
			);
			pokemon = result.data;
		} catch (error) {
			log.error(
				`Failed to fetch ${host}:${port}/static/pokedata/pokemon.json with error ${error}`
			);
		}

		log.debug(`Retrieved ${pokemon.length} amount Pokemon`);

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
			this.getGeneric("/static/pokedata/abilities.json", searchTerm),
			this.getGeneric("/static/pokedata/items.json", searchTerm),
			this.getGeneric("/static/pokedata/moves.json", searchTerm),
			this.getGeneric("/static/pokedata/types.json", searchTerm),
			this.getPokemon(searchTerm),
		]).then((values) => {
			return {
				Abilities: values[0],
				Items: values[1],
				Moves: values[2] as Moves[],
				Types: values[3] as Types[],
				Pokemon: values[4] as PokemonName[],
			};
		});
	};
}

export default Model;
