const getCookie = name => {
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i].split("=")[0].trim() === name) {
			return cookies[i].split("=")[1];
		}
	}
};

const setCookie = (name, value) => {
	const expires = new Date();
	expires.setDate(expires.getDate() + 90);

	document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax;`;
};
