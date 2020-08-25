import { v4 as uuidv4 } from "uuid";

export function removeFromArrayMutably(item, arr) {
  if (item === undefined) throw new Error("function removeFromArrayMutably expected an item but received undefined");
  const foundIndex = arr.indexOf(item);
  if (foundIndex === -1) return arr;
  arr.splice(foundIndex, 1);
  return arguments;
}

export const fetchHandler = {
  get: (url, { onStatus = [], onNotStatus = [], ...fetchOpts } = {}) => {
    const controller = new AbortController();
    const id = uuidv4();

    if (!Array.isArray(onStatus)) onStatus = [onStatus];
    if (!Array.isArray(onNotStatus)) onNotStatus = [onNotStatus];
    validateStatusHandler(onStatus);
    validateStatusHandler(onNotStatus);

    const request = fetch(url, {
      method: "GET",
      signal: controller.signal,
      ...fetchOpts
    })
      .then((res) => {
        for (const ob of onStatus) {
          if (res.status === ob.status) {
            // where a status matches, call the provided callback and return unless specified
            ob.callback();
            if (!ob.continue) return;
          }
        }
        for (const ob of onNotStatus) {
          if (res.status !== ob.status) {
            // where a status does NOT match, call the provided callback and return unless specified
            ob.callback();
            if (!ob.continue) return;
          }
        }
        if (!res.ok) {
          throw new Error(
            `Request to url ${url} has failed. Status ${res.status}: ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        return Promise.reject(err);
      });

    return {
      id,
      request,
      controller
    };
  },
  post: () => {}
};

/**
 * Function to throw if statusHandler array does not have required keys
 * @param {Array[Object]} statusHandler - Array with objects expecting keys 'status'<Number>, 'callback'<Function> and optional 'continue'<Bool>
 */
function validateStatusHandler(statusHandler) {
  if (!statusHandler.length) return;
  const isMissingProperties = statusHandler.some((ob) => {
    return !ob.hasOwnProperty("status") || !ob.hasOwnProperty("callback");
  });
  if (isMissingProperties) {
    throw new Error(
      `expected 'onStatus'/'onNotStatus' option to be object or array of objects with keys 'status', 'callback', and optional 'continue', but received ${statusHandler}`
    );
  }
}
