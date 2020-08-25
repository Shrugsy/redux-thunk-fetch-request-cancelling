import { useEffect, useState, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  sleep,
  randomIntFromInterval,
  addToArrayImmutably,
  removeFromArrayImmutably
} from "../utils";
import useIsMountedRef from "./useIsMountedRef";

function requestHelper(url, opts) {
  const controller = new AbortController(); // new controller for each request
  const signal = controller.signal;
  const request = fetch(url, { ...opts, signal }).then(async (res) => {
    await sleep(randomIntFromInterval(500, 3000), { signal }); // add a longer fake delay for demo purposes
    return res.json();
  });
  return { request, controller };
}

/**
 * Hook to perform http requests upon argument changes
 * This hook includes an `abortController` which aborts previous requests when a new request is fired
 * and aborts the pending request when the hook unmounts
 * @param {String} url - url to search for
 * @param {Object} opts - function options and fetch options
 * @param {Any} deps - optional additional dependencies to trigger re-run
 * @returns {Object} - {data, loading, error, controller}
 * data {Any} - The response item from the http request (default null while no request fired or requests are pending)
 * loading {Bool} - Whether there are any pending requests (default false)
 * error {Any} - Error returned from the latest request (default null while no request fired or latest request had no error)
 * controller {Object} - controller object for the latest request
 */
export default function useRequest(url, opts = {}, deps) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const latestController = useRef(new AbortController());
  const isMounted = useIsMountedRef();

  useEffect(() => {
    latestController.current.abort(); // abort any previous request before proceeding
    const {
      shouldRun = true,
      onStart,
      onSuccess,
      onAbort,
      onError,
      ...restOpts
    } = opts;

    async function runEffect() {
      // add request to 'activeRequests'
      const requestID = uuidv4();
      setActiveRequests((prevRequests) =>
        addToArrayImmutably(requestID, prevRequests)
      );
      // ONSTART CALLBACK HERE
      try {
        if (onStart) onStart();
        // REQUEST HERE
        const { request, controller } = requestHelper(url, restOpts);

        latestController.current = controller; // assign controller variable to use outside of this scope
        const receivedData = await request;
        if (isMounted.current) {
          if (!latestController.current.signal.aborted) {
            // handle successful request
            // check if aborted here because in the case of additional async code after 'await request'
            // or if abort signal was sent at a point where error wont' be thrown
            // e.g. during 'await res.json()'
            // ONSUCCESS HERE
            setData(receivedData);
            setError(null);
            if (onSuccess) onSuccess(receivedData);
          } else {
            // ONABORT HERE
            // handle aborted (usually don't want to do anything if aborted)
            setData(null);
            setError(null);
            if (onAbort) onAbort();
          }
        }
      } catch (err) {
        if (isMounted.current) {
          // handle request errors
          setData(null);
          setError(err);
          if (err.name === "AbortError") {
            // ONABORT HERE
            if (onAbort) onAbort(err);
          } else {
            // ONERROR HERE
            if (onError) onError(err);
          }
        }
      }

      if (isMounted.current) {
        // remove request from activeRequests
        setActiveRequests((prevRequests) =>
          removeFromArrayImmutably(requestID, prevRequests)
        );
      }
    }

    // reset to defaults
    setData(null);
    setError(null);
    // run effect if applicable
    shouldRun && isMounted.current && runEffect();

    return () => {
      // when useEffect triggers, abort the previous request
      latestController.current.abort();
    };
  }, [url, opts, deps, isMounted]);

  const loading = useMemo(() => !!activeRequests.length, [activeRequests]);
  const controller = latestController.current;
  return { data, loading, error, controller };
}
