# safe-retry

Type-safe retry utility with exponential backoff support.
For a more in-depth overview on how this can be helpful, read
the following blogpost: [Retrying API Calls with Exponential Backoff in JavaScript](https://bpaulino.com/entries/retrying-api-calls-with-exponential-backoff).

### Install safe-retry from npm

```shell
npm install safe-retry --save
```

## How to use it

Have a look at the [sample project](https://github.com/brunojppb/safe-retry/tree/main/packages/sample) for a demo,
but here is the minimal usage of the `retry` function:

```ts
import { retry } from "safe-retry";

const result = await retry(
  () => {
    console.log("Something that returns a promise");
    return Promise.reject();
  },
  {
    maxRetries: 4,
    onRetry: (retryAttempt, timeToWait) => {
      console.log(
        `Waiting for ${timeToWait}ms before next attempt. Attempt: ${retryAttempt}`
      );
    },
  }
);
```

In the example above, if the promise given as the first argument fails,
it will be retries at least 4 times given the `maxRetries` option,
and it will exponentially wait on every failed attempt, until it either
reaches its maximum retry limit or resolves.
