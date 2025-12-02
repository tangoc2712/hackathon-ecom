import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import "./index.css";
import store from './redux/store';


// Security Cleanup: Remove suspicious localStorage keys
const suspiciousKeys = ['binance', 'eth', 'bitcoin', 'wallet', 'mining', 'ledger', 'trezor'];
suspiciousKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`Removing suspicious key from localStorage: ${key}`);
    localStorage.removeItem(key);
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>
);
