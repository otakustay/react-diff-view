import '@babel/polyfill';
import {render} from 'react-dom';
import {App} from './components';

render(
    <App />,
    document.body.appendChild(document.createElement('div'))
);
