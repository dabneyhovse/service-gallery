/**
 * Author:	Nick Jasinski
 *
 * Main react component for the service
 *
 */

import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ExampleListItem } from "./components";
import { fetchExamples } from "./store/example";

function Service() {
  // the first .example is the routename of this
  // service
  const dispatch = useDispatch();
  const { loaded, examples, username } = useSelector((state) => ({
    loaded: state.example !== undefined, // check if the page has loaded in the redux yet
    examples: state.example == undefined ? [] : state.example.example.examples,
    username: state.user.data.username,
  }));

  useEffect(() => {
    dispatch(fetchExamples());
  }, []);

  return (
    <div className="container mainContent">
      <h1>Examples:</h1>
      <h2>hello {username}, look at all the examples below:</h2>
      <ul>
        {loaded
          ? examples.map((ex) => <ExampleListItem key={ex.id} text={ex.text} />)
          : ""}
      </ul>
    </div>
  );
}

export default Service;
