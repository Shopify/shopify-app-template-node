import React from "react";
import ReactDOM from "react-dom";
import { Heading, Page } from "@shopify/polaris";
import MyApp from "./App";

ReactDOM.render(
  <MyApp>
    <Page>
      <Heading>Shopify app with Node and React 🎉</Heading>
    </Page>
  </MyApp>,
  document.getElementById("root")
);
