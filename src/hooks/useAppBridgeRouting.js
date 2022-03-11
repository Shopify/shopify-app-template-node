import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRoutePropagation } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

export function useAppBridgeRouting(app) {
  const navigate = useNavigate();
  const location = useLocation();

  useRoutePropagation(location);

  useEffect(() => {
    app.subscribe(Redirect.Action.APP, ({ path }) => {
      navigate(path);
    });
  }, []);
}
