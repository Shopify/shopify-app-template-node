import { useContext, useEffect, useState } from "react";
import { Context as ShopifyContext } from "@shopify/app-bridge-react";
import { ContextualSaveBar as SaveBar } from "@shopify/app-bridge/actions";

function useContextualSaveBar(save, discard) {
  const [shouldSave, setShouldSave] = useState(false);
  const [shouldDiscard, setShouldDiscard] = useState(false);

  useEffect(() => {
    if (shouldSave) {
      save[0]();
      setShouldSave(false);
    }
  }, [shouldSave, ...save]);

  useEffect(() => {
    if (shouldDiscard) {
      discard[0]();
      setShouldDiscard(false);
    }
  }, [shouldDiscard, ...discard]);

  return [() => setShouldSave(true), () => setShouldDiscard(true)];
}

const ContextualSaveBar = ({ isShown, save, discard, options }) => {
  const app = useContext(ShopifyContext);
  const [saveBar] = useState(SaveBar.create(app, options));
  const [onSave, onDiscard] = useContextualSaveBar(save, discard);

  useEffect(() => {
    const saveUnsub = saveBar.subscribe(SaveBar.Action.SAVE, onSave);

    const discardUnsub = saveBar.subscribe(SaveBar.Action.DISCARD, onDiscard);

    return () => {
      saveUnsub();
      discardUnsub();
    };
  }, []);

  if (isShown) {
    saveBar.dispatch(SaveBar.Action.SHOW);
  } else {
    saveBar.dispatch(SaveBar.Action.HIDE);
  }

  return null;
};

export default ContextualSaveBar;
