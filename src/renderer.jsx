import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './shared/store';
import App from './App';
import './index.css';

createRoot(document.getElementById('app')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
