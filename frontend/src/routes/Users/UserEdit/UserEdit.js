import React, { useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import MenuItem from "@material-ui/core/MenuItem";
import LinearProgress from "@material-ui/core/LinearProgress";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { compose } from "redux";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import PropTypes from "prop-types";

import { postUser, putUser, getUser } from "../../../store/reducers/user";
import Snack from "../../../components/Notification";
import { showSnack } from "../../../store/reducers/snack";
import ROLES from "../../../helpers/role";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="#">
        Review Restaurant System - Toptal
      </Link>{" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

const validate = (values) => {
  const errors = {};
  const requiredFields = ["email", "firstName", "lastName", "password"];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = "Required";
    } else if (values[field].length < 3 || values[field].length > 50) {
      errors[field] = "Length must be between 3 and 50";
    }
  });
  if (values.firstName && !/^[a-zA-Z]+$/.test(values.firstName)) {
    errors.firstName = "First Name must be string.";
  }
  if (values.lastName && !/^[a-zA-Z]+$/.test(values.lastName)) {
    errors.lastName = "Last Name must be string.";
  }
  if (
    values.email &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
  ) {
    errors.email = "Invalid email address";
  }
  return errors;
};

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function UserEdit(props) {
  const classes = useStyles();
  const { postUser, putUser, showSnack, getUser, user } = props;
  const params = useParams();

  useEffect(() => {
    if (params.id) getUser({ id: params.id });
  }, [params.id, getUser]);

  const initialValues = {
    firstName: params.id && user ? user.firstName : "",
    lastName: params.id && user ? user.lastName : "",
    email: params.id && user ? user.email : "",
    password: "",
    role: params.id && user ? user.role : "",
  };

  const handleSubmit = (values, actions) => {
    const body = { ...values };
    params.id
      ? putUser({
          id: params.id,
          body: body,
          success: () => {
            actions.setSubmitting(false);
            showSnack({ message: "Successfully Updated!", status: "success" });
          },
          fail: (err) => {
            actions.setSubmitting(false);
            showSnack({ message: err.response.data, status: "error" });
          },
        })
      : postUser({
          body: body,
          success: () => {
            actions.setSubmitting(false);
            showSnack({ message: "Successfully Created!", status: "success" });
          },
          fail: (err) => {
            actions.setSubmitting(false);
            showSnack({ message: err.response.data, status: "error" });
          },
        });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Snack />
        <Typography component="h1" variant="h5">
          {params.id ? "UPDATE" : "CREATE"}
        </Typography>
        <Formik
          onSubmit={handleSubmit}
          enableReinitialize={true}
          initialValues={initialValues}
          validate={validate}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    autoComplete="firstName"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    component={TextField}
                    name="firstName"
                    id="firstName"
                    label="First Name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    autoComplete="lastName"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    component={TextField}
                    name="lastName"
                    id="lastName"
                    label="Last Name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    autoComplete="email"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    component={TextField}
                    name="email"
                    type="email"
                    id="email"
                    label="Email Address"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    autoComplete="password"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    component={TextField}
                    name="password"
                    id="password"
                    type="password"
                    label="Password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    autoComplete="role"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    select
                    component={TextField}
                    name="role"
                    id="role"
                    type="text"
                    label="Role"
                  >
                    {ROLES.map((option) => {
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </Field>
                </Grid>
              </Grid>
              {isSubmitting && <LinearProgress />}
              <br />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={submitForm}
                className={classes.submit}
              >
                {params.id ? "Update" : "Create"}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}

UserEdit.propTypes = {
  postUser: PropTypes.func.isRequired,
  putUser: PropTypes.func.isRequired,
  showSnack: PropTypes.func.isRequired,
  getUser: PropTypes.func.isRequired,
  user: PropTypes.object,
};

const mapStateToProps = (state) => ({
  user: state.user.user,
});

const mapDispatchToProps = {
  postUser: postUser,
  putUser: putUser,
  getUser: getUser,
  showSnack: showSnack,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(UserEdit);
