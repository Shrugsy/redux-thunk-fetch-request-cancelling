import { configureStore } from "@reduxjs/toolkit";
import peopleSlice from "./peopleSlice";

const reducer = {
  people: peopleSlice.reducer
};

export const store = configureStore({
  reducer
});

export default store;
