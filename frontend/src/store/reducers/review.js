import { createAction, handleActions } from "redux-actions";

import { Success, Fail } from "../../api/status";
import {
  GET_REPORT,
  POST_REVIEW,
  PUT_REVIEW,
  DELETE_REVIEW,
  GET_REVIEWS,
  SET_REVIEW_PARAMS,
} from "../../helpers/constants";

const initialState = {
  reports: {},
  reviews: [],
  review: null,
  total: 0,
  params: {
    page: 0,
    limit: 5,
  },
  error: "",
};

// Actions
export const getReviews = createAction(GET_REVIEWS);
export const postReview = createAction(POST_REVIEW);
export const putReview = createAction(PUT_REVIEW);
export const deleteReivew = createAction(DELETE_REVIEW);
export const getReport = createAction(GET_REPORT);
export const setParams = createAction(SET_REVIEW_PARAMS);

// Reducer
export default handleActions(
  {
    [SET_REVIEW_PARAMS]: (state, { payload }) => ({
      ...state,
      params: {
        ...state.params,
        ...payload,
      },
    }),
    [Success(GET_REVIEWS)]: (state, action) => {
      return {
        ...state,
        reviews: action.payload.data,
        total: action.payload.total,
        error: null,
      };
    },

    [Fail(GET_REVIEWS)]: (state, { payload }) => ({
      ...state,
      error: payload.data,
    }),
    [Success(POST_REVIEW)]: (state, { payload }) => ({
      ...state,
      review: payload,
      error: null,
    }),
    [Fail(POST_REVIEW)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
        review: null,
      };
    },
    [Success(PUT_REVIEW)]: (state, { payload }) => {
      return {
        ...state,
        restaurant: payload,
        error: null,
      };
    },
    [Fail(PUT_REVIEW)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
      };
    },
    [Success(GET_REPORT)]: (state, { payload }) => {
      return {
        ...state,
        reports: payload,
        error: null,
      };
    },
    [Fail(GET_REPORT)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
      };
    },
    [Success(DELETE_REVIEW)]: (state) => {
      return {
        ...state,
        error: null,
      };
    },
    [Fail(DELETE_REVIEW)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
      };
    },
  },
  initialState
);
