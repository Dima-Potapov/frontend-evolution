/*
 * index.jsx — точка входа.
 * render() из solid-js/web вызывает App ОДИН раз и вставляет готовый DOM в #root.
 * Виртуального DOM нет: дальше обновляются только конкретные узлы.
 */
import { render } from 'solid-js/web';
import App from './App';
import './styles.css';

render(() => <App />, document.getElementById('root'));
