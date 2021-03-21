webfront-lib
=============

This library is intended to be used as git submodule for SPA projects. The goal was to write a minimalistic replacement for frontend frameworks like react or vue in typescript with no dependencies. This README is also a reminder for myself on how I personally would like to create web projects.

The library is provided "as is", feel free to fork it.

# Visual Studio Code
## Extensions
Install the following extensions in vs code:
* **lit-html / bierner.lit-html**: to get syntax highlighting when writing html in javascript
* **ESLint / dbaeumer.vscode-eslint**: to get linting directly in js.

## Settings
add the following in the settings.json to get:
* linting on save
* get emmet in javascript / typescript

```json
{
    // ...
    "emmet.includeLanguages": {
        "javascript": "html",
        "typescript": "html"
    },
    "editor.codeActionsOnSave": {
        "source.fixAll": true
    },
    // ...
}
```

# Start a new project
## init
```bash
# create directories & files
mkdir -p src/components src/public/css src/public/fav src/public/img build
touch src/public/css/style.scss

# init git
git init
cat << EOF > .gitignore
.DS_Store
node_modules/
build/
.parcel-cache/
.env*.local
EOF

# add readme
cat << EOF > README.md
README
======
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


# nodejs
npm init
npm install --save-dev typescript parcel sass @types/node @mischnic/parcel-resolver-root

# eslint
npm install --save-dev eslint
#npx install-peerdeps --dev eslint-config-airbnb
npx eslint --init
How would you like to use ESLint? · syntax, problems, style
What type of modules does your project use? · javascript modules
Which framework does your project use? · none
Does your project use TypeScript? · Yes
Where does your code run? · browser
How would you like to define a style for your project? · guide
Which style guide do you want to follow? · airbnb
What format do you want your config file to be in? · JavaScript
Install Dependencies

# typescript
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
    "downlevelIteration": true
  },
  "include": [
      "src/**/*"
  ]
}
EOF

# declarations.d.ts
cat << EOF > src/declarations.d.ts
declare module '*.png'
declare module '*.jpg'
declare module '*.svg'
EOF

# index.html
cat << EOF > src/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="/public/css/normalize.css">
    <link rel="stylesheet" href="/public/css/skeleton.css">
    <link rel="stylesheet" href="/public/css/style.scss">
    <title>Hello World</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="/index.ts"></script>
  </body>
</html>
EOF

# store.js
cat << EOF > src/store.ts
import ApplicationStore, { Store } from './lib/store';

type AppState = {};

const initialState : AppState = {};

// save initial state, with persist set to true
export default new ApplicationStore(initialState, true);

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
cat << EOF > src/components/app.ts
import Component from '../lib/component';
import { html, render } from '../lib/html';

export default class App extends Component {
  constructor() {
    super({
      element: <HTMLElement>document.getElementById('app'),
    });
  }

  render() : void {
    const content = html`
      <div class="container main">
        <h3>Hello world</h3>
      </div>
    `;
    render(this.element, content);
  }
}
EOF

# index.ts
cat << EOF > src/index.ts
import './store';
import App from './components/app';

new App().render();
EOF

# Dockerfile
cat << EOF > Dockerfile
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
    "dev": "parcel src/index.html --dist-dir build/debug",
    "build": "NODE_ENV=production parcel build src/index.html --dist-dir build/release --public-url ./"
  },
	"@mischnic/parcel-resolver-root": {
		"/": "./src"
	}
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


## skeleton css
* download skeleton css from http://getskeleton.com/ and add it to public/css/ 
* add references in index.html

## css icons
* get awesome css icons from: https://cssicon.space
* add reference in index.html
```bash
curl https://cssicon.space/css/icons.css -o src/public/css/icons.css
```

## favicon
* generate files using https://favicon.io/ and place them in public/fav
* add references in index.html
* adjusts paths (in index.html and /public/fav/site.webmanifest)

# run project
```bash
npm run dev
```