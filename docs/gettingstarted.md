# starting a new project

## init folder & files
```bash
# create directories & files
mkdir -p src/api src/components src/styles src/assets/fav src/assets/img build

# init git
git init
cat << EOF > .gitignore
.DS_Store
*.css.ts
node_modules/
build/
.parcel-cache/
.env*.local
EOF

# add readme
cat << EOF > README.md
# README
EOF

# add changelog
cat << EOF > CHANGELOG.md
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - $(date +"%F")
### Added
* project structure
EOF

# add MIT license
cat << EOF > LICENSE
Copyright $(date +"%Y") $(whoami)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
EOF

# styles
# scss file for custom styles
cat << "EOF" > ./src/styles/custom.scss
// custom
@import '../lib/styles/variables';

html, body {
  height: 100%;
  margin: auto;
}

.wrapper .container {
  max-width: 80rem;
}

body {
  background-color: var($--color-background);
  color: var($--color-on-background);
}

// ...

EOF

# scss file for theme colors
cat << "EOF" > ./src/styles/_colors.scss
@import '../lib/styles/variables';

// light
$colors-light: (
  $--color-background: #AAAAAA,
  $--color-on-background: #000000,
  $--color-surface: #FFFFFF,
  $--color-on-surface: #111111,
  $--color-primary: #277DA1,
  $--color-on-primary: #FFFFFF,
  $--color-secondary: #577590,
  $--color-on-secondary: #FFFFFF,
  $--color-accent: #4D908E,
  $--color-on-accent: #FFFFFF,
  $--color-success: #90BE6D,
  $--color-on-success: #111111,
  $--color-warning: #F9C74F,
  $--color-on-warning: #111111,
  $--color-error: #F94144,
  $--color-on-error: #FFFFFF,
);

// dark
$colors-dark: (
  $--color-background: #121212,
  $--color-on-background: #FFFFFF,
  $--color-surface: #121212,
  $--color-on-surface: #FFFFFF,
  $--color-primary: #277DA1,
  $--color-on-primary: #FFFFFF,
  $--color-secondary: #577590,
  $--color-on-secondary: #FFFFFF,
  $--color-accent: #4D908E,
  $--color-on-accent: #FFFFFF,
  $--color-success: #90BE6D,
  $--color-on-success: #111111,
  $--color-warning: #F9C74F,
  $--color-on-warning: #111111,
  $--color-error: #F94144,
  $--color-on-error: #FFFFFF,
);

EOF

# light and dark theme
cat << "EOF" > ./src/styles/themes.scss
@import 'colors';
@import '../lib/styles/mixins';

// Light
@media (prefers-color-scheme: light) {
  :root {
    @include spread-hex-color-map($colors-light);
  }
}
// Dark
@media (prefers-color-scheme: dark) {
  :root {
    @include spread-hex-color-map($colors-dark);
  }
}

EOF


# nodejs
npm init
# runtime dependencies
npm install --save lit

# dev dependencies
npm install --save-dev typescript @types/node sass cross-env parcel@next @babel/plugin-proposal-decorators @parcel/babel-preset-env @babel/preset-typescript

# typescript
npm install -g typescript
tsc --init

# add this lib
git submodule add https://github.com/rbicker/webfront-lib src/lib

# tsconfig.json
cat << EOF > tsconfig.json
{
  "compilerOptions": {
    "target": "es5",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
    "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
    "strict": true,                           /* Enable all strict type-checking options. */
    "esModuleInterop": true,                  /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
    "forceConsistentCasingInFileNames": true,  /* Disallow inconsistently-cased references to the same file. */
    "lib": [ "ESNext", "DOM", "DOM.Iterable" ],
    "downlevelIteration": true,
    "experimentalDecorators": true
  },
  "include": [
      "src/**/*"
  ]
}
EOF

# eslint typescript airbnb (https://www.npmjs.com/package/eslint-config-airbnb-typescript)
npm install --save-dev eslint-plugin-import@^2.22.0 @typescript-eslint/eslint-plugin@^4.4.1
cat << EOF > .eslint.js
module.exports = {
  extends: [
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['.eslintrc.js', '/build/**/*'],
  rules: {
  },
};
EOF

# babel config
cat << EOF > .babelrc
{
	"presets": [
		["@parcel/babel-preset-env", {
      "targets": {
        "browsers": ["last 2 Chrome versions"]
      }
    }],
		"@babel/preset-typescript"
	],
	"plugins": [
		["@babel/plugin-proposal-class-properties"],
		["@babel/plugin-proposal-decorators", { "decoratorsBeforeExport" : true}]
	]
}
EOF

# index.html
cat << EOF > src/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">
    <link rel="stylesheet" href="/src/styles/themes.scss">
    <link rel="stylesheet" href="/src/styles/custom.scss">
    <title>Hello</title>
  </head>
  <body>
    <x-app></x-app>
    <script src="/src/index.ts"></script>
  </body>
</html>

EOF

# store.js
cat << EOF > src/store.ts
import ApplicationStore, { Store } from './lib/store';

type AppState = {
  name : string
};

const initialState : AppState = {
  name: 'World',
};

// save initial state, with persist set to true
export default new ApplicationStore(initialState, false);

// method to reset state
const resetStore = (store: Store) : void => {
  store.resetState('reset');
};

export {
  AppState,
  resetStore,
};
EOF

# app.ts
cat << "EOF" > src/components/app.ts
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import store from '../store';

@customElement('x-app')
export default class App extends LitElement {
  static styles = [
    css`
    :host{
      display: block;
      background-color: var(--color-surface);
      color: var(--color-on-surface);
    }
    `,
  ];

  @property({ type: String })
  name = store.state.name as String;

  private handleStateName = (e : Event) => {
    // `this` refers to the component
    // because we use an arrow function
    this.name = (e as CustomEvent).detail.data as String;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('appstate:name', this.handleStateName);
  }

  disconnectedCallback() {
    window.removeEventListener('appstate:name', this.handleStateName);
    super.disconnectedCallback();
  }

  render() {
    return html`
    <div class="container">
      <div class="row">
        <div class="column">
          <h1>Hello ${this.name.charAt(0).toUpperCase() + this.name.slice(1)}!</h1>
        </div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'x-app': App,
  }
}

EOF

# index.ts
cat << EOF > src/index.ts
import store from './store';
import Router from './lib/router';
import './components/app';

// routing
const router = new Router();
router.addRoute(/^\/(?<name>.*)/, (next, groups) => {
  let name = 'World';
  if (groups && groups.name) {
    name = groups.name;
  }
  if (store.state.name !== name) {
    store.set('name', name);
  }
  next();
});

router.handlePath(window.location.pathname);

document.addEventListener('click', router.getClickHandler);

EOF

# global.d.ts
# index.ts
cat << "EOF" > src/global.d.ts
declare module '*.png'
declare module '*.jpg'
declare module '*.svg'

EOF

# Dockerfile
cat << "EOF" > Dockerfile
FROM node:alpine AS builder
COPY . /usr/local/src/site
WORKDIR /usr/local/src/site
RUN npm install && npm run build

FROM nginx
RUN echo '\n\
server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    server_name _;\n\
    location /not-found {\n\
        return 404;\n\
    }\n\
    location / {\n\
        try_files $uri /index.html;\n\
    }\n\
}\n\
\n'\
> /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /usr/local/src/site/build/release/ /usr/share/nginx/html
EOF
```

## adjust configurations
### package.json
```json
  // ...
  // add scripts
  "scripts": {
    "build-css": "npx cross-env node src/lib/scripts/sasstolit.js",
    "dev": "npx cross-env parcel serve ./src/index.html --dist-dir build/debug",
    "build": "npx cross-env NODE_ENV=production parcel build src/index.html --dist-dir build/release"
  },
	"@mischnic/parcel-resolver-root": {
		"/": "./src"
	},
  // ...
```

### .eslintrc.js
```javascript
module.exports = {
  // ...
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-unresolved': [
      2,
      { ignore: ['^url:'] },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.jsx'],
      },
    },
  },
};

```

## milligram css
* download milligram css
* add minified css file to ./src/styles/milligram.min.css
* add reference in index.html

## css icons
* get awesome css icons from: https://cssicon.space
* add reference in index.html
```bash
curl https://cssicon.space/css/icons.css -o src/public/css/icons.css
```

## favicon
* generate files using https://favicon.io/ and place them in src/assets/fav
* add references in index.html
* adjusts paths (in index.html and /public/fav/site.webmanifest)

## compile sass to lit css for the first time
```bash
npm run build-css
```

## create file to merge different lit-css files
```bash
cat << "EOF" > ./src/styles/styles.ts
import milligramStyle from './milligram.min-css';
import milliStyle from '../lib/styles/milli-css';
import milliResponsive from '../lib/styles/milli-responsive-css';
import customStyle from './custom-css';

export default [
  milligramStyle,
  milliStyle,
  milliResponsive,
  customStyle,
];

EOF
