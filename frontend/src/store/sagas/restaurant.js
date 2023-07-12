/* eslint-disable no-unused-vars */
import { takeLatest } from "redux-saga/effects";
import {
  GET_RESTAURANTS,
  POST_RESTAURANT,
  PUT_RESTAURANT,
  DELETE_RESTAURANT,
  GET_RESTAURANT,
} from "../../helpers/constants";
import apiCall from "../../api/api";

const getRestaurant = apiCall({
  type: GET_RESTAURANT,
  method: "get",
  path: (payload) => `/restaurants/${payload.id}/`,
});

const getRestaurants = apiCall({
  type: GET_RESTAURANTS,
  method: "get",
  path: "/restaurants/",
});

const postRestaurant = apiCall({
  type: POST_RESTAURANT,
  method: "post",
  path: "/restaurants/",
});

const putRestaurant = apiCall({
  type: PUT_RESTAURANT,
  method: "put",
  path: (payload) => `/restaurants/${payload.id}/`,
});

const deleteRestaurant = apiCall({
  type: DELETE_RESTAURANT,
  method: "delete",
  path: (payload) => `/restaurants/${payload.id}/`,
});

export default function* rootSaga() {
  yield takeLatest(GET_RESTAURANTS, getRestaurants);
  yield takeLatest(POST_RESTAURANT, postRestaurant);
  yield takeLatest(DELETE_RESTAURANT, deleteRestaurant);
  yield takeLatest(PUT_RESTAURANT, putRestaurant);
  yield takeLatest(GET_RESTAURANT, getRestaurant);
}
