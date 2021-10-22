![Loxer_Logo](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/Logo.png)
# Loxer ![GitHub release (latest by date)](https://img.shields.io/github/v/release/pcprinz/loxer) ![GitHub Release Date](https://img.shields.io/github/release-date/pcprinz/loxer) ![GitHub branch checks state](https://img.shields.io/github/checks-status/pcprinz/loxer/master?label=build) ![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/pcprinz/329161dbcfd07c60d90c29cc887130fb/raw/loxer__heads_master.json)
 ![npm bundle size](https://img.shields.io/bundlephobia/min/loxer) ![GitHub](https://img.shields.io/github/license/pcprinz/loxer) 
<!-- https://shields.io/ -->

**Loxer** is a middleware logger that allows you to:
- distribute logs to different output streams (dev / prod / log / error)
- add levels to logs
- categorize logs in modules (with their own levels)
- connect logs to each other to "boxes"
- improve error logs (with more information)
- get significantly better visualization of the logs
- visualize the data flow (including time measurement)

With Loxer, logs never have to be deleted again, as they hardly use any resources when switched off. Logs and error records can easily be forwarded to crash reporting systems such as Firebase. This makes it possible to get error reports that are just as good in the production environment as in the development environment. Furthermore, errors in concurrent functional processes can be detected more easily.

## Documentation
The **[API Reference](https://pcprinz.github.io/loxer/index.html)** provides a complete overview of all the features of the package. Furthermore, the complete source code is documented with js-doc and typed with typscript, which guarantees full IDE support.

The **[Documentation](https://github.com/pcprinz/loxer/blob/master/documentation/index.md)** contains detailed instructions on how to use the package.

The **[Performance Tests](https://github.com/pcprinz/loxer/blob/master/documentation/Performance.md)** documents how small the influence of the package is on the performance of an application.

## Preview Example

Consider the following log output (without the log date):
<!-- ![plain_console](/assets/docs_images/plainOutput.png) -->
![plain_console](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/plainOutput.png)

As you can see the logs might tell something considering you know where they come from and what they do, but obviously they seem to be pretty uninformative.

Let's see what Loxer can do about this:
<!-- ![plain_console](/assets/docs_images/goodOutput.png) -->
![plain_console](https://raw.githubusercontent.com/pcprinz/loxer/master/assets/docs_images/goodOutput.png)

The log messages are exactly the same, but with a litte configuration you can see what is happening in the application. Even if you are not familiar with the code you can follow the implemented data flow by just one sight.

> Watch this [comparison with a slider](https://cdn.knightlab.com/libs/juxtapose/latest/embed/index.html?uid=9e14a828-2f7d-11ec-abb7-b9a7ff2ee17c)
## Installation 
`npm i --save loxer` or `yarn add loxer` thats it.

## Work in progress

This package is still under construction, so consider it as *alpha*. The API will probably change until the Playground is ready and a missing feature (Catch-Guardian) is done. This hopefully won't take too long (weeks). After that the package will stay in *beta* until everything is covered in tests. Therefore the API won'T change anymore (hopefully). Nevertheless, everything seems to work at this moment, though the package is already in production usage.

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
  
These features are already covered in the [Documentation](https://github.com/pcprinz/loxer/blob/master/documentation/index.md) and [API Reference](https://pcprinz.github.io/loxer/index.html).

## Soon
- The documentation will get improved 
- There will be tests to verify the functionality of the existing code
- There will be a playground to demonstrate everything
- There will also be a try catch guardian (Decorator?), that will handle error recovery mechanisms like 'retry', 'replace' and 'resume'

## Deps
just [color](https://www.npmjs.com/package/color)
