# run project
after creating the project structure and all the required files, you should now be able to run the project by using the defined scriped named "dev".
```bash
npm run dev
```
whenever you change your source scss files, do not forget to generate the lit-css files.
```bash
npm run build-css
```

# build project
use docker to build your project for production.
```bash
docker build -t myproject-xy:latest .
```
you can run the resulting docker image locally on your computer...
```bash
# run container
docker run --rm -p 8080:80 myproject-xy:latest
# open http://localhost:8080 in your webbrowser
````
... or on any server for production, using kubernetes or docker-compose.

