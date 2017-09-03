import {PureComponent} from 'react';
import parseDiff from 'parse-diff';
import File from './File';
import './App.css';

/* eslint-disable no-console */

export default class App extends PureComponent {

    state = {
        diff: null,
        viewType: 'split'
    };

    async componentDidMount() {
        const response = await fetch('assets/large.diff');
        const text = await response.text();
        console.time('parse');
        const diff = parseDiff(text);
        console.timeEnd('parse');
        this.setState({diff});
    }

    componentWillUpdate() {
        console.time('render');
    }

    componentDidUpdate() {
        console.timeEnd('render');
        console.time('paint');
        requestAnimationFrame(() => requestAnimationFrame(() => console.timeEnd('paint')));
    }

    switchViewType() {
        const {viewType} = this.state;
        this.setState({viewType: viewType === 'unified' ? 'split' : 'unified'});
    }

    render() {
        const {diff, viewType} = this.state;

        if (!diff) {
            return <div />;
        }

        return (
            <div className="app">
                <header>
                    <button className="switch" onClick={::this.switchViewType}>
                        切换至{viewType === 'unified' ? '双列' : '单列'}视图
                    </button>
                </header>
                <div>
                    {diff.map((file, i) => <File key={i} {...file} viewType={viewType} />)}
                </div>
            </div>
        );
    }
}
