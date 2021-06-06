# sasstolit

I mostly prefere to use sass over writing lit-css within javascript. This is why this library provides a script to compile (s)css files to lit-css typescript files.
The resulting files are stored under the same paths as the input files while the extensions are being replaces with "-css.ts".

Example:
./src/styles/custom.scss -> ./src/styles/custom-css.ts

Sass partials (files having names starting with underscore) are being ignored while creating output files.

```bash
# run 
npm run build-css

# or
node src/lib/scripts/sasstolit.js ./sourcefolder
```