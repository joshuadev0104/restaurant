import React from "react";
import Routes from "./routes";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

import Header from "./components/Header";
import configureStore from "./store/configureStore";

const initialState = {};

const store = configureStore(initialState);

const theme = useTheme();

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <ThemeProvider theme={theme}>
          <Header />
          <Routes />
        </ThemeProvider>
      </Router>
    </Provider>
  );
};

export default App;
