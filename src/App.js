import React, { useState } from "react";
import "./styles.css";
import PersonRequester from "./Components/PersonRequester";
import Status from "./Components/Status";

export default function App() {
  const [isMounted, setIsMounted] = useState(true);

  function toggleMount() {
    setIsMounted((prev) => !prev);
  }

  return (
    <div className="App">
      <h3>Redux Thunk fetch request cancelling</h3>
      <Status />
      <div>
        <button onClick={toggleMount}>
          {isMounted ? "Unmount" : "Mount"} 'person requester'
        </button>
      </div>
      {isMounted ? <PersonRequester /> : null}
    </div>
  );
}
