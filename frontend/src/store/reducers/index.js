import { combineReducers } from "redux";

import auth from "./auth";
import snack from "./snack";
import user from "./user";
import restaurant from "./restaurant";
import review from "./review";

export default combineReducers({
  auth,
  snack,
  user,
  restaurant,
  review,
});
