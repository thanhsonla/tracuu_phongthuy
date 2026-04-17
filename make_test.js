import { readFileSync, writeFileSync } from 'fs';
writeFileSync('test_render.jsx', `
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';
import GuestWizard from './src/components/GuestWizard.jsx';

global.window = { addEventListener: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = {};

try {
  console.log("App Render:", renderToString(<App />).substring(0,20));
  console.log("GuestWizard Render:", renderToString(<GuestWizard />).substring(0,20));
} catch(e) {
  console.error("RENDER ERROR:", e);
}
`);
