import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";
import Rating from "@material-ui/lab/Rating";
import {
  Typography,
  TablePagination,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
} from "@material-ui/core";
import ReplyIcon from "@material-ui/icons/Reply";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import MaterialTable, { MTableToolbar } from "material-table";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import StarIcon from "@material-ui/icons/Star";

import Snack from "../../components/Notification";
import {
  postReview,
  putReview,
  getReviews,
  getReport,
  setParams,
  deleteReivew,
} from "../../store/reducers/review";
import { getRestaurant } from "../../store/reducers/restaurant";
import { showSnack } from "../../store/reducers/snack";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
  },
  margin: {
    margin: theme.spacing(2, 0),
  },
}));

const StyledRating = withStyles({
  iconFilled: {
    color: "#ff6d75",
  },
  iconHover: {
    color: "#ff3d47",
  },
})(Rating);

function ReviewsList(props) {
  const {
    me,
    showSnack,
    params,
    setParams,
    total,
    postReview,
    getReviews,
    getReport,
    reviews,
    reports,
    restaurant,
    getRestaurant,
    putReview,
    deleteReview,
  } = props;

  const { id: restaurantId } = useParams();

  useEffect(() => {
    getReviews({ params, id: restaurantId });
    getReport({ id: restaurantId });
    getRestaurant({ id: restaurantId });
  }, [getReviews, params, restaurantId, getReport, getRestaurant]);

  const classes = useStyles();
  const actions = [];
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (me.role !== "user") {
    actions.push((rowData) => ({
      icon: () => <ReplyIcon />,
      tooltip: "Reply to comment",
      onClick: (event, rowData) => {
        handleClickOpen();
        setSelected(rowData._id);
      },
      disabled: !!rowData.reply,
    }));
  }

  const handleFormSubmit = ({ reply }) => {
    new Promise((resolve, reject) => {
      setTimeout(() => {
        putReview({
          body: {
            reply: reply,
          },
          restaurantId: restaurantId,
          id: selected,
          success: () => {
            resolve();
            getRestaurant({ id: restaurantId });
            getReviews({ params, id: restaurantId });
            showSnack({
              message: "Review updated.",
              status: "success",
            });
          },
          fail: (err) => {
            reject();
            showSnack({
              message: err.response.data,
              status: "error",
            });
          },
        });
      }, 600);
    });

    handleClose();
  };

  const renderModal = () => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        aria-labelledby="form-dialog-title"
      >
        <Formik
          initialValues={{ reply: "" }}
          validate={(values) => {
            const errors = {};
            if (!values.reply) {
              errors.reply = "Reply text can not be blank";
            }

            return errors;
          }}
          onSubmit={handleFormSubmit}
        >
          {({ submitForm, isSubmitting }) => (
            <>
              <DialogTitle id="form-dialog-title">Reply</DialogTitle>
              <DialogContent>
                <Form noValidate>
                  <Field
                    component={TextField}
                    autoComplete="reply"
                    name="reply"
                    required
                    fullWidth
                    id="reply"
                    label="reply"
                    autoFocus
                  />
                </Form>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="default">
                  Cancel
                </Button>
                <Button onClick={submitForm} color="primary">
                  Save
                </Button>
              </DialogActions>
            </>
          )}
        </Formik>
      </Dialog>
    );
  };

  const handleChangeRowsPerPage = (event, callBack) => {
    setParams({ limit: parseInt(event.target.value, 10), page: 0 });
    callBack(event);
  };

  const handleChangePage = (event, newPage) => {
    setParams({ page: newPage });
  };

  const columnsArray = [
    {
      title: "Date of Visit",
      field: "date",
      editComponent: (props) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            id="date-picker-inline"
            value={props.value}
            onChange={props.onChange}
            keyboardbuttonprops={{
              "aria-label": "change date",
            }}
            maxDate={new Date()}
          />
        </MuiPickersUtilsProvider>
      ),
      initialEditValue: new Date(),
      type: "date",
      filtering: false,
    },
    {
      title: "Rate",
      field: "rate",
      render: (rowData) => (
        <StyledRating
          name="rate"
          defaultValue={rowData ? rowData.rate : 0}
          value={rowData ? rowData.rate : 0}
          precision={0.5}
          readOnly
          icon={<StarIcon fontSize="inherit" />}
        />
      ),
      editComponent: (props) => (
        <StyledRating
          name="rate"
          value={props ? Number(props.value) : 0}
          onChange={(e) => {
            e.preventDefault();
            props.onChange(e.target.value);
          }}
          precision={0.5}
          icon={<StarIcon fontSize="inherit" />}
        />
      ),
      initialEditValue: 0,
      filtering: false,
    },
    {
      title: "Comment",
      field: "comment",
    },
    {
      title: "Commented by",
      field: "commentedBy",
      render: (rowData) =>
        rowData && rowData.user ? (
          <div>
            {rowData.user.firstName} {rowData.user.lastName}
          </div>
        ) : (
          ""
        ),
      editable: "never",
      filtering: false,
    },
    {
      title: "Reply",
      field: "reply",
      editable: me.role === "admin" ? "always" : "never",
    },
  ];

  return (
    <Container component="main">
      <div className={classes.paper}>
        <Snack />
        <MaterialTable
          columns={columnsArray}
          data={reviews}
          title="DETAIL VIEW"
          options={{
            search: false,
            actionsColumnIndex: -1,
          }}
          actions={actions}
          components={{
            Pagination: (props) => (
              <TablePagination
                {...props}
                count={total}
                rowsPerPage={params.limit}
                page={params.page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={
                  // eslint-disable-next-line react/prop-types
                  (event) =>
                    handleChangeRowsPerPage(event, props.onChangeRowsPerPage)
                }
              />
            ),
            Toolbar: (props) => {
              return (
                <div>
                  <MTableToolbar {...props} />
                  {!!restaurant.reviewCount && (
                    <Box
                      display="flex"
                      alignItems="center"
                      flexDirection="row"
                      justifyContent="space-around"
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        className={classes.customToolbar}
                      >
                        <Typography variant="h5" component="h6">
                          Overall Average Rating (
                          {restaurant.averageRate
                            ? restaurant.averageRate.toFixed(2)
                            : 0}
                          ):
                        </Typography>
                        <StyledRating
                          name="rate"
                          defaultValue={restaurant.averageRate}
                          readOnly
                          precision={0.1}
                          icon={<StarIcon fontSize="inherit" />}
                        />
                      </Box>
                      <Box>
                        {reports.max && (
                          <Box display="flex" alignItems="center">
                            <Box width={140}>Highest rated review:</Box>
                            <StyledRating
                              name="rate"
                              defaultValue={reports.max.rate || 0}
                              precision={0.1}
                              readOnly
                              icon={<StarIcon fontSize="inherit" />}
                            />
                            <Box>({reports.max.rate})</Box>
                          </Box>
                        )}
                        {reports.min && (
                          <Box display="flex" alignItems="center">
                            <Box width={140}>Lowest rated review:</Box>
                            <StyledRating
                              name="rate"
                              defaultValue={reports.min.rate || 0}
                              precision={0.1}
                              readOnly
                              icon={<StarIcon fontSize="inherit" />}
                            />
                            <Box>({reports.min.rate})</Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </div>
              );
            },
          }}
          editable={{
            onRowAdd:
              me.role !== "owner"
                ? (newData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        postReview({
                          body: {
                            date: newData.date,
                            rate: newData.rate,
                            comment: newData.comment,
                            reply: newData.reply,
                          },
                          id: restaurantId,
                          success: () => {
                            resolve();
                            getReviews({ params, id: restaurantId });
                            showSnack({
                              message: "Review created.",
                              status: "success",
                            });
                          },
                          fail: (err) => {
                            reject();
                            showSnack({
                              message: err.response.data,
                              status: "error",
                            });
                          },
                        });
                      }, 600);
                    })
                : undefined,
            onRowUpdate:
              me.role === "admin"
                ? (newData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        putReview({
                          body: {
                            date: newData.date,
                            rate: newData.rate,
                            comment: newData.comment,
                            reply: newData.reply,
                          },
                          restaurantId: restaurantId,
                          id: newData._id,
                          success: () => {
                            resolve();
                            getRestaurant({ id: restaurantId });
                            getReviews({ params, id: restaurantId });
                            showSnack({
                              message: "Review updated.",
                              status: "success",
                            });
                          },
                          fail: (err) => {
                            reject();
                            showSnack({
                              message: err.response.data,
                              status: "error",
                            });
                          },
                        });
                      }, 600);
                    })
                : undefined,
            onRowDelete:
              me.role === "admin"
                ? (oldData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        deleteReview({
                          restaurantId: restaurantId,
                          id: oldData._id,
                          success: () => {
                            resolve();
                            getReviews({ params, id: restaurantId });
                            showSnack({
                              message: "Review has been removed.",
                              status: "success",
                            });
                          },
                          fail: (err) => {
                            reject();
                            showSnack({
                              message: err.response.data,
                              status: "error",
                            });
                          },
                        });
                      }, 600);
                    })
                : undefined,
          }}
        />
        {renderModal()}
      </div>
    </Container>
  );
}

ReviewsList.propTypes = {
  showSnack: PropTypes.func.isRequired,
  postReview: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,

  me: PropTypes.object.isRequired,
  getReport: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { me } = state.auth;
  const { reviews, total, params, reports } = state.review;
  const { restaurant } = state.restaurant;
  return {
    me,
    reviews,
    total,
    params,
    reports,
    restaurant,
  };
};

const mapDispatchToProps = {
  showSnack: showSnack,
  postReview: postReview,
  setParams: setParams,
  putReview: putReview,
  getReport: getReport,
  getReviews: getReviews,
  getRestaurant: getRestaurant,
  deleteReview: deleteReivew,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  ReviewsList
);
