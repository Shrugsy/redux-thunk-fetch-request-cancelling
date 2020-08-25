import { createSlice, createAction } from "@reduxjs/toolkit";
import { fetchHandler, removeFromArrayMutably } from "../utils";

// actionBois
const addPerson = createAction("people/add");
const fetchPending = createAction("people/fetch/pending");
const fetchFulfilled = createAction("people/fetch/fulfilled");
const fetchRejected = createAction("people/fetch/rejected");
const fetchAborted = createAction("people/fetch/aborted");

// 'out of scope' variable to store the previous controller;
let lastController;
// thunkyBoi that returns the request promise, and controller to abort the request
export const fetchPerson = (opts = {}) => (dispatch) => {
  lastController && lastController.abort(); // abort previous request before continuing
  if (opts.abort) return; // if we asked to just abort, don't proceed with rest of thunk
  const url = "https://randomuser.me/api/";
  const { id, request, controller } = fetchHandler.get(url, opts);
  lastController = controller;
  dispatch(fetchPending(id));

  request
    .then((data) => {
      if (controller.signal.aborted) {
        dispatch(fetchAborted(id));
        return null;
      }
      dispatch(fetchFulfilled(id));
      dispatch(addPerson(data.results[0]));
      return data;
    })
    .catch((err) => {
      if (err.name === "AbortError") {
        dispatch(fetchAborted(id));
        return null; // return normally if aborted
      }
      const errorPayload = {
        id,
        error: err.toString()
      };
      dispatch(fetchRejected(errorPayload));
      return Promise.reject(err);
    });
  return { request, controller };
};

// sliceyBoi
export const peopleSlice = createSlice({
  name: "people",
  initialState: {
    people: [],
    requestIDs: [],
    isLoading: false,
    error: null,
    isAborted: false
  },
  extraReducers: {
    [addPerson]: (draftState, { payload }) => {
      if (payload) {
        draftState.people.push(payload);
      }
    },
    [fetchPending]: (draftState, { payload }) => {
      draftState.requestIDs.push(payload);
      draftState.isLoading = draftState.requestIDs.length > 0;
      draftState.error = null;
      draftState.isAborted = false;
    },
    [fetchFulfilled]: (draftState, { payload }) => {
      removeFromArrayMutably(payload, draftState.requestIDs);
      draftState.isLoading = draftState.requestIDs.length > 0;
      draftState.error = null;
      draftState.isAborted = false;
    },
    [fetchRejected]: (draftState, { payload }) => {
      const { requestID, error } = payload;
      removeFromArrayMutably(requestID, draftState.requestIDs);
      draftState.isLoading = draftState.requestIDs.length > 0;
      draftState.error = error;
      draftState.isAborted = false;
    },
    [fetchAborted]: (draftState, { payload }) => {
      removeFromArrayMutably(payload, draftState.requestIDs);
      draftState.isLoading = draftState.requestIDs.length > 0;
      draftState.error = null;
      draftState.isAborted = true;
    }
  }
});

export default peopleSlice;
