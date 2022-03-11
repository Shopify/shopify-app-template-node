import { Route, Routes as ReactRouterRoutes } from "react-router-dom";

import { useAppBridgeRouting } from "../hooks";
import { HomePage } from "./pages/HomePage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { AboutPage } from "./pages/AboutPage";

const ROUTES = [
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

export function Routes() {
  useAppBridgeRouting(ROUTES);

  return (
    <ReactRouterRoutes>
      <Route path="/" element={<HomePage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/about" element={<AboutPage />} />
    </ReactRouterRoutes>
  );
}
