<h1 align="center">Welcome to kanvas-dialog 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/kanvas-dialog" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/kanvas-dialog.svg">
  </a>
  <a href="https://github.com/hata6502/kanvas/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/hata6502" target="_blank">
    <img alt="Twitter: hata6502" src="https://img.shields.io/twitter/follow/hata6502.svg?style=social" />
  </a>
</p>

> A sketching canvas written in Web Components.

#### ✨ [Demo](https://kanvas.b-hood.site/)

## Install

```sh
npm i kanvas-dialog
```

## Usage

Insert `<kanvas-dialog />` element in the HTML document.

```html
<body>
  <button id="open-button">Open</button>
  <kanvas-dialog id="dialog"></kanvas-dialog>
</body>
```

Kanvas dialog is open when `open` attribute is set.

```js
import "kanvas-dialog";

const dialog = document.querySelector("#dialog");
const openButton = document.querySelector("#open-button");

openButton.addEventListener("click", () => dialog.setAttribute("open", ""));
```

## Development

```bash
npm run build && npm run serve
```

## Run tests

```sh
npm test
```

## Author

<img alt="Tomoyuki Hata" src="https://avatars.githubusercontent.com/hata6502" width="48" /> **Tomoyuki Hata <hato6502@gmail.com>**

- Website: [Scrapbox](https://scrapbox.io/hata6502/)
- Twitter: [@hata6502](https://twitter.com/hata6502)
- Github: [@hata6502](https://github.com/hata6502)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!
Feel free to check [issues page](https://github.com/hata6502/kanvas/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Tomoyuki Hata <hato6502@gmail.com>](https://github.com/hata6502).
This project is [MIT](https://github.com/hata6502/kanvas/blob/main/LICENSE) licensed.

## Disclaimer

The following creations are included in this product:

- [google/material-design-icons](https://github.com/google/material-design-icons/blob/master/LICENSE)

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
