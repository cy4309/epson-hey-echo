import ReactDOM from "react-dom/client";
// import '@/hooks/i18n';
import { store } from "@/stores/store";
import { Provider } from "react-redux";
import App from "@/App.jsx";
import "@/assets/styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </React.StrictMode>
);
