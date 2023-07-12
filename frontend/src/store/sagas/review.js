/* eslint-disable no-unused-vars */
import { takeLatest } from "redux-saga/effects";
import {
  GET_REPORT,
  POST_REVIEW,
  PUT_REVIEW,
  DELETE_REVIEW,
  GET_REVIEWS,
} from "../../helpers/constants";
import apiCall from "../../api/api";

const getReport = apiCall({
  type: GET_REPORT,
  method: "get",
  path: (payload) => `/restaurants/${payload.id}/report`,
});

const getReviews = apiCall({
  type: GET_REVIEWS,
  method: "get",
  path: (payload) => `/restaurants/${payload.id}/reviews`,
});

const postReview = apiCall({
  type: POST_REVIEW,
  method: "post",
  path: (payload) => `/restaurants/${payload.id}/reviews`,
});

const putReview = apiCall({
  type: PUT_REVIEW,
  method: "put",
  path: (payload) =>
    `/restaurants/${payload.restaurantId}/reviews/${payload.id}`,
});

const deleteReview = apiCall({
  type: DELETE_REVIEW,
  method: "delete",
  path: (payload) =>
    `/restaurants/${payload.restaurantId}/reviews/${payload.id}`,
});

export default function* rootSaga() {
  yield takeLatest(GET_REPORT, getReport);
  yield takeLatest(POST_REVIEW, postReview);
  yield takeLatest(DELETE_REVIEW, deleteReview);
  yield takeLatest(PUT_REVIEW, putReview);
  yield takeLatest(GET_REVIEWS, getReviews);
}
