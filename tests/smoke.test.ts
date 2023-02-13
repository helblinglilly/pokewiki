import { test, expect } from "@playwright/test";

const baseURL = process.env.BASE_URL ? process.env.BASE_URL : "localhost:3000";

test("Page has title", async ({ page }) => {
	await page.goto(baseURL);
	await expect(page).toHaveTitle(/Pokécompanion/);
});

test("Search returns a result", async ({ page }) => {
	await page.goto(baseURL);

	// Search
	const id = Math.floor(Math.random() * (1008 - 1) + 1);
	await page.getByPlaceholder("Search for something!").click();
	await page.getByPlaceholder("Search for something!").fill(id.toString());
	await page.getByPlaceholder("Search for something!").press("Enter");

	await expect(page.locator("#PokemonResults").locator(".searchResult")).toHaveCount(1);
});
