import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
	use: {
		headless: false,
		viewport: { width: 1280, height: 720 },
		ignoreHTTPSErrors: true,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		// {
		// 	name: "firefox",
		// 	use: { ...devices["Desktop Firefox"] },
		// },
		// {
		// 	name: "webkit",
		// 	use: { ...devices["Desktop Safari"] },
		// },
	],
});
