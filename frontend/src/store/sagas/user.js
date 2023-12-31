/* eslint-disable no-unused-vars */
import { takeLatest } from "redux-saga/effects";
import {
  GET_USERS,
  POST_USER,
  PUT_USER,
  DELETE_USER,
  GET_USER,
  GET_OWNERS,
} from "../../helpers/constants";
import apiCall from "../../api/api";

const getUser = apiCall({
  type: GET_USER,
  method: "get",
  path: (payload) => `/users/${payload.id}/`,
});

const getUsers = apiCall({
  type: GET_USERS,
  method: "get",
  path: "/users/",
});

const getOwners = apiCall({
  type: GET_OWNERS,
  method: "get",
  path: "/users/owners",
});

const postUser = apiCall({
  type: POST_USER,
  method: "post",
  path: "/users/",
});

const putUser = apiCall({
  type: PUT_USER,
  method: "put",
  path: (payload) => `/users/${payload.id}/`,
});

const deleteUser = apiCall({
  type: DELETE_USER,
  method: "delete",
  path: (payload) => `/users/${payload.id}/`,
});

export default function* rootSaga() {
  yield takeLatest(GET_USERS, getUsers);
  yield takeLatest(POST_USER, postUser);
  yield takeLatest(DELETE_USER, deleteUser);
  yield takeLatest(PUT_USER, putUser);
  yield takeLatest(GET_USER, getUser);
  yield takeLatest(GET_OWNERS, getOwners);
}
