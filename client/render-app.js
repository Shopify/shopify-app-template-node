import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {BrowserRouter} from 'react-router-dom';

export default function renderApp(appContainerElement, App) {
  if (appContainerElement) {
    ReactDOM.hydrate(
      <AppContainer>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppContainer>,
      appContainerElement,
    );
  }
}
