import assert from "node:assert";

import { retry } from ".";
/** Fake an API Call that fails for the first 3 attempts
 * and resolves on its fourth attempt.
 */
function generateFailableAPICall() {
  let counter = 0;
  return function () {
    if (counter < 3) {
      counter++;
      return Promise.reject(new Error("Simulated error"));
    } else {
      return Promise.resolve({ status: "ok" });
    }
  };
}

/*** Testing our Retry with Exponential Backoff */
async function test() {
  const apiCall = generateFailableAPICall();
  const result = await retry(apiCall, {
    maxRetries: 4,
    onRetry: () => {
      console.log("onRetry called...");
    },
  });

  assert(result.status === "ok");
}

test();
