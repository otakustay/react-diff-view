import 'core-js/stable';
import {createRoot} from 'react-dom/client';
import App from '../components/App';
import {StrictMode} from 'react';


const root = createRoot(document.body.appendChild(document.createElement('div')));
root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
