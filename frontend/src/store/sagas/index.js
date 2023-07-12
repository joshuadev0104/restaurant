import { all } from "redux-saga/effects";

import auth from "./auth";
import user from "./user";
import restaurant from "./restaurant";
import review from "./review";

export default function* rootSaga() {
  yield all([auth(), user(), restaurant(), review()]);
}
