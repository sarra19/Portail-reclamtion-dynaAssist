import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import Navbar from "components/Navbars/AuthNavbar.js";
import FooterSmall from "components/Footers/FooterSmall.js";

// views

import Login from "views/auth/Login.js";
import Register from "views/auth/Register.js";
import HeaderAuth from "components/Header/HeaderAuth";
import OTPInput from "views/auth/OTPInput";
import ModifierPassword from "views/auth/ModifierPassword";

export default function Auth() {
  return (
    <>
      <HeaderAuth absolute />
      <Navbar transparent />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url(" + require("assets/img/bg112.jpg") + ")",
            }}
          >
            {/* Overlay semi-transparent */}
            <div
              className="absolute top-0 w-full h-full opacity-50"
            ></div>
          </div>
          <Switch>
            <Route path="/auth/login" exact component={Login} />
            <Route path="/auth/otp" exact component={OTPInput} />
            <Route path="/auth/modifierPwd" exact component={ModifierPassword} />
            <Route path="/auth/register" exact component={Register} />
            <Route path="/auth/reset" exact component={ModifierPassword} />

            <Redirect from="/auth" to="/auth/login" />
          </Switch>
          <FooterSmall absolute />
        </section>
      </main>
    </>
  );
}
