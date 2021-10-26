
import React from "react";
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import routes from "routes.js";
import logo from "assets/img/react-logo.png";
import { BackgroundColorContext } from "contexts/BackgroundColorContext";

var ps;

function Admin(props) {

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  return (
    <React.Fragment>
      <div className="wrapper">
        <div className="main-panel">
          <AdminNavbar />
          <Switch>
            {getRoutes(routes)}
            <Redirect from="*" to="/admin/dashboard" />
          </Switch>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Admin;
