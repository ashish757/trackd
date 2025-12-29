import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import  {Provider} from 'react-redux';
import {store} from './redux/store.ts'
import { WebSocketProvider } from './hooks/useWebSocket.tsx'

// Register service worker for notifications
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
            console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <WebSocketProvider>
              <BrowserRouter>
                  <App />
              </BrowserRouter>
          </WebSocketProvider>
      </Provider>
  </StrictMode>,
)
