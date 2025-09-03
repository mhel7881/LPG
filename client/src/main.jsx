import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Register service worker for offline support and push notifications
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
            console.log('Service Worker registered successfully:', registration);
        })
            .catch(function (registrationError) {
            console.error('Service Worker registration failed:', registrationError);
        });
    });
}
createRoot(document.getElementById("root")).render(<App />);
