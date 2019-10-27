import 'core-js/stable';
import {render} from 'react-dom';
import App from './components/App';

render(
    <App />,
    document.body.appendChild(document.createElement('div'))
);
