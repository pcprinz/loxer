# Performance impact

## The Environment
|     |                                |
| --- | ------------------------------ |
| CPU | Ryzen 5 3600 - 6Cores @3593MHz |
| RAM | 2 x 8GB DDR4 @2666MHz          |

## The Setup
The test setup consists of a function that receives a count `X` and a depth `Y`:
- loop `Y` times and call `Loxer.open()`
- loop `Y` times and call `Loxer.add()` and `Loxer.error()`
- loop `Y` times and call `Loxer.close()`
- repeat this until every log was called `X` times.

The test function though runs 3 loops with `Y` calls resulting in `4 * Y` deeply nested logs. 
This means that `Y` represents the depth of the nested logs and `X` how many every type of log is called. The remaining logs will be filled with a neither deep nesting.
###### Example:
- `X = 5` and `Y = 2` will produce
```console
╭← open log
│╭← open log
├┆─ append to log   [1ms]
├┆─ Error: append an error to log
│├─ append to log   [1ms]
│├─ Error: append an error to log
│╰→ close log   [2ms]
╰→ close log   [3ms]
╭← open log
│╭← open log
├┆─ append to log   [0ms]
├┆─ Error: append an error to log
│├─ append to log   [1ms]
│├─ Error: append an error to log
│╰→ close log   [1ms]
╰→ close log   [1ms]
╭← open log
├─ append to log   [1ms]
├─ Error: append an error to log
╰→ close log   [1ms]
```


## The tests
The tests consist of calling the function X times and measuring the time that is required for it. Each test is carried out 10 times and then averaged over time.

The depth `Y` is set to `60` in every test, in order to represent a natural but maximum value. Nesting logs deeper than 60 (and this is much) will lead to have an unreadable output - and probably an not performant application anyways. 

### Test 1 - Loxer disabled
This scenario is true when Loxer gets the `options.config.disabled` or `options.config.disabledInProductionMode` option with `true`. Then all all functions are switched off and all logging methods are returned directly.

- `X` = 100'000'000
  
| run | time (in ms) |
| --- | ------------ |
| 1   | 2809         |
| 2   | 2752         |
| 3   | 2777         |
| 4   | 2765         |
| 5   | 2757         |
| 6   | 2774         |
| 7   | 2767         |
| 8   | 2735         |
| 9   | 2725         |
| 10  | 2775         |
| avg | 2763,6       |

- 1 log takes 0,000006909 ms
- 144.738.746 logs take 1 second

As you can see, when Loxer is disabled, it has almost no influence on the performance. Only around 144 million log calls have a performance loss of 1 second.


### Test 2 - Logs not leveled
This scenario applies to logs that are not logged because their level does not correspond to the actual log level.

- `X` = 100'000
  
| run | time (in ms) |
| --- | ------------ |
| 1   | 4524         |
| 2   | 4588         |
| 3   | 4550         |
| 4   | 4518         |
| 5   | 4539         |
| 6   | 4498         |
| 7   | 4515         |
| 8   | 4532         |
| 9   | 4572         |
| 10  | 4539         |
| avg | 4537,5       |

- 1 log takes 0,01134375 ms 
- 88.154 logs take 1 second

As you can see, even the out-leveled logs have almost no influence on the performance. Only around 88 thousand log calls have a performance loss of 1 second.

### Test 3 - Custom output stream
This scenario applies to those logs that are actually forwarded to the output stream. It should be noted that the performance measurement ONLY applies to the generation of the output. But not on further processing, which of course can be extremely different and is added to this measurement.

- `X` = 10'000
  
| run | time (in ms) |
| --- | ------------ |
| 1   | 2256         |
| 2   | 2271         |
| 3   | 2326         |
| 4   | 2288         |
| 5   | 2290         |
| 6   | 2275         |
| 7   | 2288         |
| 8   | 2264         |
| 9   | 2450         |
| 10  | 2257         |
| avg | 2296,4       |

- 1 log takes 0,05741 ms
- 17.418 logs take 1 second

The processing of the logs takes some effort. It is about 5 times more demanding than not preparing logs for the output. But every 17 thousand logs a 1 second loss of performance should be more than acceptable in most cases.

### Test 4 - Console output (default dev output)
This scenario applies above all to the default output stream in the development environment. The output is printed in the console after processing (see last test).

- `X` = 2'000
  
| run | time (in ms) |
| --- | ------------ |
| 1   | 3269         |
| 2   | 3318         |
| 3   | 3518         |
| 4   | 3337         |
| 5   | 3458         |
| 6   | 3351         |
| 7   | 3365         |
| 8   | 3330         |
| 9   | 3364         |
| 10  | 3501         |
| avg | 3381,1       |

- 1 log takes 0,422625 ms !!!
- 2.366 logs take 1 second

Given these numbers, it becomes clear how resource hungry the preparation of the message and printing to the console is. Even if you just lose 1 second of performance at around 2366 logs, only around 14% of the performance can be attributed to Loxer's calculations and the remaining 86% to the console and message preparation! In this case it is only understandable not to want to use any console outputs in the production environment.

### Using the History
The history chaches the last logs. The number of logs to be cached can be specified in the OOO. It can be queried at any time with LLL. However, it is also automatically added as a property to all error logs. However, the error logs that appear in the history no longer have a history in order to avoid cycles.

However, the caching of the logs has an influence on the performance, which is shown in this test. The setup from [Test 3](#test-3---custom-output-stream) is taken as the basis, as this is the most likely one.

| cache size | run | time (in ms)    |
| ---------- | --- | --------------- |
| 20         | 1   | 4566            |
| 20         | 2   | 4561            |
| 20         | 3   | 4770            |
| 20         | avg | 4632,3 (+94,8)  |
| 50         | 1   | 4571            |
| 50         | 2   | 4614            |
| 50         | 3   | 4712            |
| 50         | avg | 4632,3 (+94,8)  |
| 200        | 1   | 4182            |
| 200        | 2   | 4167            |
| 200        | 3   | 4195            |
| 200        | avg | 4181,3 (-356,2) |
| 500        | 1   | 4835            |
| 500        | 2   | 4839            |
| 500        | 3   | 4815            |
| 500        | avg | 4829,6 (+292,2) |
| 500        | 1   | 4575            |
| 500        | 2   | 4596            |
| 500        | 3   | 4699            |
| 500        | avg | 4616,3 (+75,8)  |

The result is astonishing. All the different cache sizes seem to have slightly increased runtimes as the number increases. However, there are a few exceptions where the running time is even shorter than without a history. The test with a size of 200 was carried out several times and always led to the same result. Similar numbers can be observed at 400. 300, however, seems to need the usual 100-200ms more again. Only from a size of 2000 do the runtimes seem to increase exponentially by more than 300ms. a test with a cache size of 100,000 logs took 49 seconds.

In summary, it should be noted that the history can be used with sizes up to 1000 ranges without hesitation.