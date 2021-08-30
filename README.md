# Loxer
Logger, Tracer, Error detector, dataflow visualizer

![Loxer_Logo](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/Logo.png)

### [Documentation](https://pcprinz.github.io/loxer/guide/index.md)
### [API Reference](https://pcprinz.github.io/loxer/index.html)

## Installation 
`npm i --save loxer` or `yarn add loxer` thats it.

## Work in progress

This package is still under construction, so consider it as *alpha*. The API will probaby change until the Playground is ready and a missing feature (Catch-Guardian) is done. This hopefully won't take too long (weeks). After that the package will stay in *beta* until everything is covered in tests. Therefore the API won'T change anymore (hopefully). Nevertheless, everything seems to work at this moment, though the package is already in production usage.

## What you get
- use levels to switch logs on / off dependent on their importance
- categorize logs in modules
- switch the output stream(s) to whatever you want dependent on the environment, as well as the type of logs
- relate logs together and build boxes, that can be opened and closed
- append logs to boxes
- draw boxes with the unicode box layout
- trace the time consumption for boxed logs
- generate rich errors with a log history, open boxes and more
- use decorators for tracing
  
These features are already covered in the [Documentation](https://pcprinz.github.io/loxer/guide/index.md) and [API Reference](https://pcprinz.github.io/loxer/index.html).

## Soon
- The documentation will get improved 
- There will be tests to verify the functionality of the existing code
- There will be a playground to demonstrate everything
- There will also be a try catch guardian (Decorator?), that will handle error recovery mechanisms like 'retry', 'replace' and 'resume'

## Deps
just [color](https://www.npmjs.com/package/color)
