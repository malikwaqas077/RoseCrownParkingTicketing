// src/appInsights.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: '<3b68b3ea-8dfd-4f12-a876-0d1698d3cdff>',
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: window.history },
    },
  },
});
appInsights.loadAppInsights();

export { appInsights, reactPlugin };
