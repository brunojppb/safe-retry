type Options = {
  /** Number of times to retry before bubbling up the error. */
  maxRetries?: number;
  /** Callback to be executed on a retry */
  onRetry?: () => void;
};

/**
 * Executes a promise and retry with exponential backoff
 * based on the maximum retry attempts it can perform.
 * @param {Promise<T>} promise Promise to be exected which can be retried in case of failures.
 * @param {Options} [options] - Options for configuring retries
 * @param {number} [options.maxRetries] - Number of times to retry before bubbling up the error.
 * @param {() => void} [options.onRetry] - Callback to be executed on a retry
 */
export function retry<T>(
  promise: () => Promise<T>,
  options?: Options
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 0;
  const onRetry = options?.onRetry;

  // Notice that we declare an inner function here
  // so we can encapsulate the retries and don't expose
  // it to the caller. This is also a recursive function
  async function retryWithBackoff(retries: number): Promise<T> {
    try {
      // Make sure we don't wait on the first attempt
      if (retries > 0) {
        // Here is where the magic happens.
        // on every retry, we exponentially increase the time to wait.
        // Here is how it looks for a `maxRetries` = 4
        // (2 ** 1) * 100 = 200 ms
        // (2 ** 2) * 100 = 400 ms
        // (2 ** 3) * 100 = 800 ms
        const timeToWait = 2 ** retries * 100;
        console.log(`waiting for ${timeToWait}ms...`);
        await waitFor(timeToWait);
      }
      return await promise();
    } catch (e) {
      // only retry if we didn't reach the limit
      // otherwise, let the caller handle the error
      if (retries < maxRetries) {
        onRetry?.();
        return retryWithBackoff(retries + 1);
      } else {
        console.warn("Max retries reached. Bubbling the error up");
        throw e;
      }
    }
  }

  return retryWithBackoff(0);
}

/**
 * Wait for the given milliseconds
 * @param {number} milliseconds The given time to wait
 * @returns {Promise} A fulfilled promise after the given time has passed
 */
function waitFor(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
