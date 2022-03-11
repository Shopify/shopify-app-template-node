import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { AppLink, NavigationMenu } from "@shopify/app-bridge/actions";

import { useAppBridgeRouting } from "../../hooks";

export function AppBridgeRouting({ navigation }) {
  const app = useAppBridge();

  useAppBridgeRouting(app);

  useEffect(() => {
    let activeLink;

    const items = navigation.map((link) => {
      const appLink = AppLink.create(app, link);
      if (link.destination == location.pathname) {
        activeLink = appLink;
      }

      return appLink;
    });

    NavigationMenu.create(app, {
      items,
      active: activeLink,
    });
  }, [app, location.pathname]);

  return null;
}
