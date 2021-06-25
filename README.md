# webfront-lib

This library is intended to be used as git submodule for web frontend projects. The goal was to write a minimalistic replacement for frontend frameworks like react or vue in typescript with minimal dependencies. This repository is also a reminder for myself on how I personally like to create web projects.

The library is provided "as is". Feel free to fork it or copy paste code to use in your own projects.

Starting from version 2, this library and my approach loosely depends on the awesome https://lit.dev project.

## docs

please note the undocumented classes, functions and components are currently a work in progress and might not work. Updates and more documentations are coming soon.

* [starting a new project](./docs/gettingstarted.md): instructions on how to create a new project 
* [state](./docs/state.md): small state machine which enables you to create a global application state
* [router](./docs/router.md): tiny router which enables you to provide handlers for regex routes
* [sass to lit-css script](./docs/sasstolit.md): generate lit css from (s)css files
* [navbar](./docs/navbar.md): flexible mobile-first navbar
* [toast](./docs/toast.md): provide user feedback in a box
* [slider](./docs/slider.md): create html elements that show their children in a loop

## some of my best practices, inspirations, helpful projects & links
* use parcel as bundler (https://parceljs.org/)
* use lit (https://lit.dev), a libary to create webcomponents
* use git (-hub) for your source code
* use something like the gitlab flow (feature branches)
* use semantic versioning for your project, (git-)tag your versions (https://semver.org/spec/v2.0.0.html)
* keep a changelog (https://keepachangelog.com)
* add a license for your open source projects, I mostly use MIT when i get to decide
* use a linter to get clean code, follow a styling guide (airbnb is a popular one)
* use a css-preprocessor (sass, using scss format)
* CSS can be structured using the BEM methology (http://getbem.com/introduction/)
* https://milligram.io/ provides a modern and tiny css library
* there are a lot of css-only icons out there, find some https://cssicon.space for example
* use a global application state that connects with components, actions, ...
* use eventlisteners to inform about state changes
* a router does not just determine which component to show, it also interacts with apis, state, ...
* https://favicon.io/ helps you generate your favicon and a web manifest
* keep the node_modules folder outside of your src folder
* When designing a webproject:
  * provide a light and a dark theme
  * use (s)css variables for theming
  * use a primary color for things that call for actions, a secondary color which is a darker / lighter shade of the primary color and an "accent color" that is used less than 10% on the website for very important highlights
  * the material theming / color approach makes sense to me

## Author
Raphael Bicker
