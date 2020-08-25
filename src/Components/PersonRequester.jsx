import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchPerson } from "../Store/peopleSlice";

export default function PersonRequester() {
  const dispatch = useDispatch();

  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    return () => {
      // on component unmount, tell thunk to just abort last request
      fetchPerson({ abort: true })();
    };
  }, []);

  async function handleFetchPerson() {
    // call thunk that auto-aborts the previous request
    const { request, controller } = dispatch(fetchPerson());
    try {
      const data = await request; // eslint-disable-line
      // Note: reducers are expected to handle the data,
      // however it is available here also for optional secondary logic
      if (controller.signal.aborted) return;
      // only proceed if request had not been aborted
      setSuccessCount((prev) => prev + 1);
    } catch (err) {
      if (err.name === "AbortError") return; // not expected to hit this, but just in case
      setErrorCount((prev) => prev + 1);
    }
  }

  return (
    <div style={{ border: "1px solid black", margin: "0 auto", maxWidth: "500px" }}>
      <button onClick={handleFetchPerson}>
        Get a new person (spam this button!)
      </button>
      <div>
        <b>Component state set after requests:</b>
      </div>
      <div>Successful requests: {successCount}</div>
      <div>Unsuccessful requests: {errorCount}</div>
    </div>
  );
}
