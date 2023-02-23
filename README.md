# Pokéwiki

<img align="left" width="100" height="100" src="./public/favicon.png" style="padding-bottom: 20px;">
<h4>The no-nonsense companion for your next Pokémon playthrough.</h4>
<a href="https://vercel.com/"><img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white">
<a href="https://github.com/helblingjoel/pokewiki/commits/main"><img src="https://badgen.net/github/commits/helblingjoel/pokewiki/main"></a>
<a href="https://github.com/helblingjoel/pokewiki/commits/main"><img src="https://badgen.net/github/last-commit/helblingjoel/pokewiki/main"></a>
<div/>
<a href="https://pokemon.helbling.uk">pokemon.helbling.uk</a>

</br>

</br>

# Features

- Global search
- Show game specific data
- Details about
  - Pokémon
  - Items
  - Moves
  - Abilities

## Roadmap

- [ ] Multi Language support
  - [x] Backend
  - [ ] Frontend
- [ ] Improve Search
- [ ] Bookmark pages
- [ ] Display Pokémon strengths/weaknesses

## Getting started

Assuming that <a href="https://nodejs.org/en/">Node</a> is installed on your system.

Install dependencies

```sh
# Install packages
npm install

# Install Typescript compiler
npm install tsc
```

Download basic datasets to enable search and render social previews

```
node scraper.js
```

To run a development build

```sh
npm run dev
```

To compile and run in production mode

```sh
# Compile
npm run prodbuild

# Run
npm run start
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the GNU General Public License v3.0 License. See `LICENSE.md` for more information.
