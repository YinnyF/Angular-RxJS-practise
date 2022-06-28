# Apm

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.2.

Added packages:
npm install bootstrap
npm install angular-in-memory-web-api
ng add @angular-eslint/schematics
npm install eslint-plugin-rxjs --save-dev
npm install eslint-plugin-rxjs-angular --save-dev
(The above also required changes to .eslintrc.json)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# Angular-RxJS-practise

## Files & Folders in `src/app`
| File/Folder  | Description |
| ------------ | ----------- |
| home | app welcome page |
| product-categories | retrieving product categories |
| products | product features, incl. a service to manage retrieving |
| shared | shared modules used by multiple features |
| suppliers | supplier features such as a service to retreive supplier information |

## How to run
* Install dependencies: `npm i`
* Start server: `npm start`