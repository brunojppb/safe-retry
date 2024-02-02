import "./style.css";
import { retry } from "safe-retry";

/** Fake an API Call that fails for the first 3 attempts
 * and resolves on its fourth attempt.
 */
function generateFailableCall() {
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

function updateUI(text: string) {
  const appNode = document.getElementById("app")!;
  appNode.innerHTML = `${appNode.innerHTML}<br/>${text}`;
}

/*** Testing our Retry with Exponential Backoff */
async function run() {
  const apiCall = generateFailableCall();
  const result = await retry(apiCall, {
    maxRetries: 4,
    onRetry: (retryAttempt, timeToWait) => {
      console.log("on retry called...");
      updateUI(
        `Waiting for ${timeToWait}ms before next attempt. Attempt: ${retryAttempt}`
      );
    },
  });

  updateUI(`Result: ${JSON.stringify(result)} ✅`);
}

document.getElementById("btn")!.addEventListener("click", function () {
  run();
});
