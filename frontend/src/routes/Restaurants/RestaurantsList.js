import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import TablePagination from "@material-ui/core/TablePagination";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Rating from "@material-ui/lab/Rating";
import { MenuItem, Select, Slider, Grid, Typography } from "@material-ui/core";
import StarIcon from "@material-ui/icons/Star";
import DetailsIcon from "@material-ui/icons/Details";
import MaterialTable, { MTableToolbar } from "material-table";

import Snack from "../../components/Notification";
import {
  getRestaurants,
  deleteRestaurant,
  putRestaurant,
  postRestaurant,
  setParams,
} from "../../store/reducers/restaurant";
import { getOwners } from "../../store/reducers/user";
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

const marks = [
  {
    value: 0,
    label: "0",
  },
  {
    value: 1,
    label: "1",
  },
  {
    value: 2,
    label: "2",
  },
  {
    value: 3,
    label: "3",
  },
  {
    value: 4,
    label: "4",
  },
  {
    value: 5,
    label: "5",
  },
];

function RestaurantsList(props) {
  const {
    getOwners,
    owners,
    getRestaurants,
    restaurants,
    info,
    putRestaurant,
    postRestaurant,
    deleteRestaurant,
    showSnack,
    params,
    setParams,
    total,
  } = props;

  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    if (info.role === "admin") {
      getOwners();
    }
    getRestaurants({ params });
  }, [getOwners, getRestaurants, params, info]);

  const ownersLookup = {};

  const handleChangePage = (event, newPage) => {
    setParams({ page: newPage });
  };

  const setAverageRateFilter = (newValue) => {
    setParams({
      filters: {
        ...params.filters,
        averageRate: {
          $gte: newValue[0],
          $lte: newValue[1],
        },
      },
    });
  };

  const handleChangeRowsPerPage = (event, callBack) => {
    setParams({ limit: parseInt(event.target.value, 10), page: 0 });
    callBack(event);
  };

  owners.forEach((owner) => {
    ownersLookup[owner._id] = `${owner.firstName} ${owner.lastName}`;
  });
  const columnsArray = [
    {
      title: "Owner",
      field: "owner",
      render: (rowData) =>
        rowData.owner ? (
          <div>
            {rowData.owner.firstName} {rowData.owner.lastName}
          </div>
        ) : (
          "-"
        ),
      lookup: ownersLookup,
      editComponent: (props) => (
        <Select
          labelId="owner-select-label"
          id="owner-select"
          value={
            typeof props.value === "string"
              ? props.value
              : props.value
              ? props.value._id
              : null
          }
          onChange={(e) => props.onChange(e.target.value)}
        >
          {Object.keys(ownersLookup).map((ownerId) => (
            <MenuItem key={ownerId} value={ownerId}>
              {ownersLookup[ownerId]}
            </MenuItem>
          ))}
        </Select>
      ),
      initialEditValue: (rowData) => (rowData.owner ? rowData.owner._id : null),
    },
    { title: "Name", field: "name" },
    {
      title: "Average Rate",
      field: "averageRate",
      render: (rowData) => (
        <StyledRating
          name="averageRate"
          defaultValue={rowData ? rowData.averageRate : 0}
          value={rowData ? rowData.averageRate : 0}
          precision={0.5}
          readOnly
          icon={<StarIcon fontSize="inherit" />}
        />
      ),
      editable: "never",
      filtering: false,
    },
    {
      title: "Reviews Count",
      field: "reviewCount",
      editable: "never",
    },
  ];

  if (info.role === "owner") {
    columnsArray.splice(0, 1);
  }

  return (
    <Container component="main">
      <div className={classes.paper}>
        <Snack />
        <MaterialTable
          title="RESTAURANTS MANAGEMENT"
          columns={columnsArray}
          data={restaurants}
          options={{
            search: false,
            actionsColumnIndex: -1,
          }}
          actions={[
            {
              icon: () => <DetailsIcon />,
              tooltip: "Go to Detail Page",
              onClick: (event, rowData) => {
                history.push(`/restaurants/${rowData._id}`);
              },
            },
          ]}
          components={{
            // eslint-disable-next-line react/display-name
            Pagination: (props) => {
              return (
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
              );
            },
            Toolbar: (props) => {
              return (
                <div>
                  <MTableToolbar {...props} />
                  <Grid className={classes.filterBar} container spacing={3}>
                    <Grid item sm={2}></Grid>
                    <Grid item sm={3}>
                      <Slider
                        min={0}
                        max={5}
                        step={0.1}
                        value={[
                          params.filters.averageRate.$gte,
                          params.filters.averageRate.$lte,
                        ]}
                        onChange={(event, newValue) => {
                          setAverageRateFilter(newValue);
                        }}
                        valueLabelDisplay="auto"
                        aria-labelledby="rate-range-slider"
                        marks={marks}
                      />
                    </Grid>
                    <Grid item sm={3}>
                      <Typography variant="h6" component="h6">
                        Filter by Rating
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
              );
            },
          }}
          localization={{
            pagination: {
              labelDisplayedRows: `${params.page * params.limit + 1}-${Math.min(
                (params.page + 1) * params.limit,
                total
              )} of ${total}`,
            },
          }}
          editable={{
            onRowAdd:
              info.role !== "user"
                ? (newData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        postRestaurant({
                          body: {
                            name: newData.name,
                            owner: newData.owner,
                          },
                          success: () => {
                            resolve();
                            getRestaurants({ params });
                            showSnack({
                              message: "Restaurant created.",
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
              info.role === "admin"
                ? (newData, oldData) => {
                    return new Promise((resolve, reject) => {
                      setTimeout(() => {
                        putRestaurant({
                          id: newData._id,
                          body: {
                            name: newData.name,
                            owner: newData.owner,
                          },
                          success: () => {
                            resolve();
                            getRestaurants({ params });
                            showSnack({
                              message: "Restautrant Record updated.",
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
                  }
                : undefined,
            onRowDelete:
              info.role === "admin"
                ? (oldData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        deleteRestaurant({
                          id: oldData._id,
                          success: () => {
                            resolve();
                            getRestaurants({ params });
                            showSnack({
                              message: "Restaurants has been removed.",
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
      </div>
    </Container>
  );
}

RestaurantsList.propTypes = {
  getRestaurants: PropTypes.func.isRequired,
  getOwners: PropTypes.func.isRequired,
  deleteRestaurant: PropTypes.func.isRequired,
  putRestaurant: PropTypes.func.isRequired,
  postRestaurant: PropTypes.func.isRequired,
  setParams: PropTypes.func.isRequired,
  restaurants: PropTypes.array.isRequired,
  showSnack: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  owners: state.user.owners,
  restaurants: state.restaurant.restaurants,
  params: state.restaurant.params,
  total: state.restaurant.total,
  info: state.auth.me,
});

const mapDispatchToProps = {
  getRestaurants: getRestaurants,
  getOwners: getOwners,
  setParams: setParams,
  showSnack: showSnack,
  deleteRestaurant: deleteRestaurant,
  putRestaurant: putRestaurant,
  postRestaurant: postRestaurant,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  RestaurantsList
);
