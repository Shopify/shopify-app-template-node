import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppBridge, useRoutePropagation } from "@shopify/app-bridge-react";
import { Redirect, AppLink, NavigationMenu } from "@shopify/app-bridge/actions";

export function useAppBridgeRouting(routes) {
  const app = useAppBridge();
  const navigate = useNavigate();
  const location = useLocation();

  useRoutePropagation(location);

  useEffect(() => {
    app.subscribe(Redirect.Action.APP, ({ path }) => {
      navigate(path);
    });
  }, []);

  useEffect(() => {
    let activeLink;

    const items = routes.map((link) => {
      const appLink = AppLink.create(app, link);
      if (link.destination === location.pathname) {
        activeLink = appLink;
      }

      return appLink;
    });

    NavigationMenu.create(app, {
      items,
      active: activeLink,
    });
  }, [app, location.pathname]);
}
