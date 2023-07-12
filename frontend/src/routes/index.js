import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import SignIn from "./Auth/SignIn";
import SignUp from "./Auth/SignUp";
import Profile from "./Auth/Profile";
import UserEdit from "./Users/UserEdit/UserEdit";
import UserList from "./Users/UserList/UserList";
import RestaurantsList from "./Restaurants";
import ReviewsList from "./Reviews";
const Routes = () => {
  const isAuthenticated = useSelector((state) => !!state.auth.token);
  const authUser = useSelector((state) => state.auth.me);
  return (
    <Switch>
      <Route
        exact
        path="/"
        render={() => {
          if (isAuthenticated) return <Redirect to="/restaurants" />;
          return <Redirect to="/login" />;
        }}
      />
      <Route path="/login" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      {isAuthenticated && (
        <Switch>
          <Route path="/profile" component={Profile} />
          <Route exact path="/restaurants" component={RestaurantsList} />
          <Route exact path="/restaurants/:id" component={ReviewsList} />
          {authUser.role === "admin" && (
            <>
              <Route exact path="/users" component={UserList} />
              <Route exact path="/add-user" component={UserEdit} />
              <Route exact path="/users/:id" component={UserEdit} />
            </>
          )}
        </Switch>
      )}
      <Route render={() => <Redirect to="/" />} />
    </Switch>
  );
};

export default Routes;
