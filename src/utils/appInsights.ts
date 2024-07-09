// src/utils/appInsights.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

const browserHistory = createBrowserHistory();
const reactPlugin = new ReactPlugin();

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: '3b68b3ea-8dfd-4f12-a876-0d1698d3cdff',
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
    },
    enableDebug: true,  // Enable debug mode
    loggingLevelConsole: 2,  // Verbose logging level
  },
});

appInsights.loadAppInsights();
console.log("Application Insights initialized", appInsights);
appInsights.trackTrace({ message: `test case` });
export { appInsights, reactPlugin, browserHistory };
