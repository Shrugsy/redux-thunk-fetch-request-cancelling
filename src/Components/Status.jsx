import React from "react";
import { useSelector } from "react-redux";

export default function Status() {
  const people = useSelector((state) => state.people.people);
  const error = useSelector((state) => state.people.error);
  const isLoading = useSelector((state) => state.people.isLoading);
  const isAborted = useSelector((state) => state.people.isAborted);

  const personData = people[people.length - 1];
  const data = personData ? { results: [personData] } : null;
  return (
    <>
      <table style={{ margin: "0 auto" }}>
        <tbody>
          <tr>
            <td>Loading: </td>
            <td>{`${isLoading}`}</td>
          </tr>
          <tr>
            <td>Error: </td>
            <td>{`${error}`}</td>
          </tr>
          <tr>
            <td>Aborted: </td>
            <td>{`${isAborted}`}</td>
          </tr>
          <tr>
            <td>Number of people: </td>
            <td>{people.length}</td>
          </tr>
          <tr>
            <td>Person name: </td>
            <td>
              <span style={{ opacity: isLoading ? 0.3 : 1 }}>
                {getName(data, error)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function getName(data, error) {
  if (error || !data || !data.results) return "No data";
  try {
    const { first, last } = data.results[0].name;
    if (!first || !last)
      throw new Error("Couldn't retrieve first or last name from data");
    return `${first} ${last}`;
  } catch (err) {
    console.error(err);
    console.error({ data });
    return "Error in data";
  }
}
