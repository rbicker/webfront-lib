# prerequisites

## Installations
Before starting a new project, ensure you have the following tools installed.
* a recent (preferably LTS) version of node.js to develop and run your project locally
* docker (& docker-compose) to build production ready containers
* visual studio code
  * **lit-html / bierner.lit-html**: to get syntax highlighting when writing html and css in javascript
  * **ESLint / dbaeumer.vscode-eslint**: to get linting directly in javascript
  * **SCSS / mrmlnc.vscode-scss**: SCSS autocomplete and syntax highlighting

## Configurations
### visual studio code
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