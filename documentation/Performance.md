# Performance impact

## The Environment
|          |                                |
| -------- | ------------------------------ |
| CPU      | Ryzen 5 3600 - 6Cores @3593MHz |
| RAM      | 2 x 8GB DDR4 @2666MHz          |
| Terminal | Windows PowerShell 7           |

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

- Test runs with 25.000.000 logs with nested depth of 60
- Total number of logs: 100.000.000 (100 million!)

| run     | time       | Logs per second  |
| ------- | ---------- | ---------------- |
| 1       | 720 ms     | ~138.888.889     |
| 2       | 753 ms     | ~132.802.125     |
| 3       | 653 ms     | ~153.139.357     |
| 4       | 648 ms     | ~154.320.988     |
| 5       | 645 ms     | ~155.038.760     |
| 6       | 648 ms     | ~154.320.988     |
| 7       | 648 ms     | ~154.320.988     |
| 8       | 654 ms     | ~152.905.199     |
| 9       | 636 ms     | ~157.232.704     |
| 10      | 639 ms     | ~156.494.523     |
| **avg** | **664 ms** | **~150.946.452** |

- 1 log (function call) consumes 0.0000066 ms
- ~150.946.452 logs consume 1 second

As you can see, when Loxer is disabled, it has almost no influence on the performance. Only around 150 million log calls have a performance loss of 1 second.


### Test 2 - Logs not leveled
This scenario applies to logs that are not logged because their level does not correspond to the actual log level.

- Test runs with 25.000 logs with nested depth of 60
- Total number of logs: 100.000

| run     | time       | Logs per second |
| ------- | ---------- | --------------- |
| 1       | 1.049 ms   | ~95.329         |
| 2       | 983 ms     | ~101.729        |
| 3       | 964 ms     | ~103.734        |
| 4       | 1.017 ms   | ~98.328         |
| 5       | 1.010 ms   | ~99.010         |
| 6       | 979 ms     | ~102.145        |
| 7       | 991 ms     | ~100.908        |
| 8       | 969 ms     | ~103.199        |
| 9       | 1.004 ms   | ~99.602         |
| 10      | 962 ms     | ~103.950        |
| **avg** | **993 ms** | **~100.794**    |

- 1 log consumes 0.0099 ms
- ~100.794 logs consume 1 second

As you can see, even the out-leveled logs have almost no influence on the performance. Only around 100 thousand log calls have a performance loss of 1 second.

### Test 3 - Custom output stream
This scenario applies to those logs that are actually forwarded to the output stream. It should be noted that the performance measurement ONLY applies to the generation of the output. But not on further processing, which of course can be extremely different and is added to this measurement.

- Test runs with 25.000 logs with nested depth of 60
- Total number of logs: 100.000

| run     | time         | Logs per second |
| ------- | ------------ | --------------- |
| 1       | 1.234 ms     | ~81.037         |
| 2       | 1.208 ms     | ~82.781         |
| 3       | 1.264 ms     | ~79.114         |
| 4       | 1.233 ms     | ~81.103         |
| 5       | 1.224 ms     | ~81.699         |
| 6       | 1.209 ms     | ~82.713         |
| 7       | 1.243 ms     | ~80.451         |
| 8       | 1.241 ms     | ~80.580         |
| 9       | 1.218 ms     | ~82.102         |
| 10      | 1.212 ms     | ~82.508         |
| **avg** | **1.229 ms** | **~81.409**     |

- 1 log consumes 0.012 ms
- ~81.409 logs consume 1 second

The processing of the logs takes some effort. It is a little more demanding than not preparing logs for the output. But around every 80 thousand logs 1 second loss of performance should be more than acceptable in most cases.

### Test 4 - Console output (default dev output)
This scenario applies above all to the default output stream in the development environment. The output is printed in the console after processing (see last test).

- Test runs with 1.000 logs with nested depth of 60
- Total number of logs: 4.000

| run     | time         | Logs per second |
| ------- | ------------ | --------------- |
| 1       | 1.294 ms     | ~3.091          |
| 2       | 1.102 ms     | ~3.630          |
| 3       | 1.045 ms     | ~3.828          |
| 4       | 1.080 ms     | ~3.704          |
| 5       | 1.034 ms     | ~3.868          |
| 6       | 1.069 ms     | ~3.742          |
| 7       | 1.038 ms     | ~3.854          |
| 8       | 1.043 ms     | ~3.835          |
| 9       | 1.090 ms     | ~3.670          |
| 10      | 1.096 ms     | ~3.650          |
| **avg** | **1.089 ms** | **~3.687**      |

- 1 log consumes 0.27 ms
- ~3.687 logs consume 1 second

Given these numbers, it becomes clear how resource hungry the preparation of the message and printing to the console is. Even if you just lose 1 second of performance at around 3.687 logs, only around 5% of the performance can be attributed to Loxer's calculations and the remaining 95% to the console and message preparation! In this case it is only understandable not to want to use any console outputs in the production environment.

But luckily you don't need to print and prepare all the logs in prod environment. The error callbacks receive a history of all logs with a predefined size, which can be utilized like the standard output, only when an error occurs. So you basically live with the 80-100K logs per second in production environment. 

> **Reminder**: All the test results relate to my used desktop system and may vary heavily depending on the device and its processing power. The purpose of this test is to show that Loxer can cause virtually no loss of performance if it is used correctly. Especially when compared to using the console output, it becomes clear how small its influence is.