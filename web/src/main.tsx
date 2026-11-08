import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { hrefs } from './router';
import './index.css';

// Back from a sign-in link in the email (?code=… or an error, S-012): to the household screen,
// which finishes the sign-in. The query stays until it has been read there.
if (/[?&](code|error|error_description)=/.test(location.search) && !location.hash.startsWith('#/household')) {
  history.replaceState(history.state, '', `${location.pathname}${location.search}${hrefs.household}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
