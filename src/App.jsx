import {AppProvider as PolarisProvider} from '@shopify/polaris';
import translations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

export default function App({children}) {
  return <PolarisProvider i18n={translations}>{children}</PolarisProvider>;
}
