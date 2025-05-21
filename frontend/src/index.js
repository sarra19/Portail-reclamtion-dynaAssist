import { Buffer } from 'buffer';
import process from 'process';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";
import App from 'App';




global.Buffer = Buffer;
global.process = process;
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
