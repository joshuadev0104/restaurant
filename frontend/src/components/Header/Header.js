import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import Proptypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Button, Tooltip } from "@material-ui/core";
import RestaurantIcon from "@material-ui/icons/Restaurant";
import GroupIcon from "@material-ui/icons/Group";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

import { signout } from "../../store/reducers/auth";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  navLink: {
    color: "white",
    textDecoration: "none",
  },
  active: {
    backgroundColor: "#1f308c7a",
  },
}));

function Header(props) {
  const { me, signout } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Review Restaurant System
          </Typography>
          {me ? (
            <>
              {me.role === "admin" && (
                <NavLink
                  className={classes.NavLink}
                  activeClassName={classes.active}
                  to="/users"
                >
                  <Tooltip title="Users">
                    <Button color="inherit">
                      <GroupIcon />
                    </Button>
                  </Tooltip>
                </NavLink>
              )}
              <NavLink
                className={classes.NavLink}
                activeClassName={classes.active}
                to="/restaurants"
              >
                <Tooltip title="Restautrants">
                  <Button color="inherit">
                    <RestaurantIcon />
                  </Button>
                </Tooltip>
              </NavLink>
              <NavLink
                className={classes.navLink}
                activeClassName={classes.active}
                to="/profile"
              >
                <Tooltip title="Profile">
                  <Button color="inherit">
                    <AccountCircleIcon />
                  </Button>
                </Tooltip>
              </NavLink>
              <NavLink
                className={classes.navLink}
                activeClassName={classes.active}
                to="/logout"
                onClick={signout}
              >
                <Tooltip title="Sign out">
                  <Button color="inherit">
                    <ExitToAppIcon />
                  </Button>
                </Tooltip>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                className={classes.navLink}
                activeClassName={classes.active}
                to="/login"
              >
                <Button color="inherit">Log In</Button>
              </NavLink>
              <NavLink
                className={classes.navLink}
                activeClassName={classes.active}
                to="/signup"
              >
                <Button color="inherit">Join</Button>
              </NavLink>
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

Header.propstypes = {
  me: Proptypes.object,
  signout: Proptypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  me: state.auth.me,
});

const mapDispatchToProps = {
  signout,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(Header);
