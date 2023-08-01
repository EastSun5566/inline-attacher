/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
// eslint-disable-next-line import/extensions
import App from './App';

const root = document.getElementById('root');

render(() => <App />, root!);
