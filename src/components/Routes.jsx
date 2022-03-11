import { Route, Routes as ReactRouterRoutes } from "react-router-dom";

import { AppBridgeRouting } from "./navigation/AppBridgeRouting";

import { HomePage } from "./pages/HomePage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { AboutPage } from "./pages/AboutPage";

const NAVIGATION_LINKS = [
  {
    label: "Home",
    destination: "/",
  },
  {
    label: "Resources",
    destination: "/resources",
  },
  {
    label: "About",
    destination: "/about",
  },
];

export default function Routes() {
  return (
    <>
      <AppBridgeRouting navigation={NAVIGATION_LINKS} />
      <ReactRouterRoutes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </ReactRouterRoutes>
    </>
  );
}
