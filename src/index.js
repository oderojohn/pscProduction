import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from '../src/service/auth/AuthContext';
import Swal from 'sweetalert2';


const tabKey = 'myAppOpenTabs';
const maxTabs = 3;
const tabId = Date.now().toString() + '-' + Math.random().toString(36).slice(2);
const heartbeatInterval = 2000; // ms
const tabExpiry = 5000; // ms

function getTabs(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(tabKey) || '{}');
  } catch {
    return {};
  }
}

function setTabs(tabs: Record<string, number>) {
  localStorage.setItem(tabKey, JSON.stringify(tabs));
}

function cleanStaleTabs(tabs: Record<string, number>) {
  const now = Date.now();
  const activeTabs: Record<string, number> = {};
  for (const [id, ts] of Object.entries(tabs)) {
    if (now - ts < tabExpiry) {
      activeTabs[id] = ts;
    }
  }
  return activeTabs;
}

// Cleanup stale tabs first
let tabs = cleanStaleTabs(getTabs());

if (Object.keys(tabs).length >= maxTabs) {
  Swal.fire({
    icon: 'warning',
    title: 'Tab Limit Reached',
    text: `Only ${maxTabs} tabs are allowed. Please Use or close an existing tab.`,
    confirmButtonText: 'OK',
    allowOutsideClick: false
  }).then(() => {
    window.location.href = 'about:blank';
  });
}

 else {
  tabs[tabId] = Date.now();
  setTabs(tabs);

  const interval = setInterval(() => {
    const updatedTabs = cleanStaleTabs(getTabs());
    updatedTabs[tabId] = Date.now();
    setTabs(updatedTabs);
  }, heartbeatInterval);

  window.addEventListener('beforeunload', () => {
    const updatedTabs = getTabs();
    delete updatedTabs[tabId];
    setTabs(updatedTabs);
    clearInterval(interval);
  });

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

reportWebVitals();
