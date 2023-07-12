import { createAction, handleActions } from "redux-actions";

import { Success, Fail } from "../../api/status";
import {
  GET_RESTAURANTS,
  POST_RESTAURANT,
  PUT_RESTAURANT,
  DELETE_RESTAURANT,
  GET_RESTAURANT,
  SET_RESTAURANT_PARAMS,
} from "../../helpers/constants";

const initialState = {
  restaurants: [],
  restaurant: {},
  total: 0,
  params: {
    page: 0,
    limit: 5,
    filters: {
      averageRate: {
        $gte: 0,
        $lte: 5,
      },
    },
  },
  error: "",
};

// Actions
export const getRestaurants = createAction(GET_RESTAURANTS);
export const postRestaurant = createAction(POST_RESTAURANT);
export const putRestaurant = createAction(PUT_RESTAURANT);
export const deleteRestaurant = createAction(DELETE_RESTAURANT);
export const getRestaurant = createAction(GET_RESTAURANT);
export const setParams = createAction(SET_RESTAURANT_PARAMS);

// Reducer
export default handleActions(
  {
    [SET_RESTAURANT_PARAMS]: (state, { payload }) => ({
      ...state,
      params: {
        ...state.params,
        ...payload,
      },
    }),
    [Success(GET_RESTAURANTS)]: (state, action) => {
      return {
        ...state,
        restaurants: action.payload.data,
        total: action.payload.total,
        error: null,
      };
    },

    [Fail(GET_RESTAURANTS)]: (state, { payload }) => ({
      ...state,
      error: payload.data,
    }),
    [Success(POST_RESTAURANT)]: (state, { payload }) => ({
      ...state,
      restaurant: payload,
      error: null,
    }),
    [Fail(POST_RESTAURANT)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
        restaurant: null,
      };
    },
    [Success(PUT_RESTAURANT)]: (state, { payload }) => {
      return {
        ...state,
        restaurant: payload,
        error: null,
      };
    },
    [Fail(PUT_RESTAURANT)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
      };
    },
    [Success(GET_RESTAURANT)]: (state, { payload }) => {
      return {
        ...state,
        restaurant: payload,
        error: null,
      };
    },
    [Fail(GET_RESTAURANT)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
      };
    },
    [Success(DELETE_RESTAURANT)]: (state) => {
      return {
        ...state,
        error: null,
      };
    },
    [Fail(DELETE_RESTAURANT)]: (state, { payload }) => {
      return {
        ...state,
        error: payload.data,
      };
    },
  },
  initialState
);
