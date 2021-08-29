# Loxer
Logger, Tracer, Error detector, dataflow visualizer

![Loxer_Logo](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/Logo.png)

Take a look at the [API Reference](https://pcprinz.github.io/loxer/index.html)
## Work in progress
Loxer will be an advanced Logger, where you (currently) can:
- use levels to switch logs on / off dependent on their importance
- categorize logs in modules
- switch the output stream(s) to whatever you want dependent on the environment, as well as tha type of logs
- relate logs together and build boxes, that can be opened and closed
- append logs to boxes
- draw boxes with the ansi box layout
- trace the time consumption for boxed logs
- generate rich errors with a log history, open boxes and more
- use decorators for tracing
  
This all should already work (as alpha) and is documented as tsdoc so you can either grab through the `src/types.ts`, just add the project and see what it is exporting, or wait until the page is ready to go.

## Soon
- There will be a documentation / guide.
- There will be tests to verify the functionality of the existing code
- There will be a playground to demonstrate everything
- There will also be a try catch guardian (Decorator?), that will handle error recovery mechanisms like 'retry', 'replace' and 'resume'
## Installation 
`npm i --save loxer` or `yarn add loxer` thats it.

## Deps
just [color](https://www.npmjs.com/package/color)
