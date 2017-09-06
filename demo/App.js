import {PureComponent} from 'react';
import {bind} from 'lodash-decorators';
import {Radio, Checkbox} from 'antd';
import 'antd/dist/antd.css';
import {parseDiff} from '../src';
import File from './File';
import './App.css';
import diffText from './assets/small.diff';
import Perf from 'react-addons-perf';
window.Perf = Perf;

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

/* eslint-disable no-console */

export default class App extends PureComponent {

    state = {
        zip: false,
        diff: null,
        viewType: 'split'
    };

    async componentDidMount() {
        const {zip} = this.state;
        console.time('parse');
        const nearbySequences = zip ? 'zip' : null;
        const diff = parseDiff(diffText, {nearbySequences});
        console.timeEnd('parse');
        this.setState({diff});
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.diff !== this.state.diff) {
            console.time('render');
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.zip !== this.state.zip) {
            const {zip} = this.state;
            const nearbySequences = zip ? 'zip' : null;
            const diff = parseDiff(diffText, {nearbySequences});
            this.setState({diff});
        }

        if (prevState.diff !== this.state.diff) {
            console.timeEnd('render');
            console.time('paint');
            requestAnimationFrame(() => requestAnimationFrame(() => console.timeEnd('paint')));
        }

    }

    @bind()
    switchViewType(e) {
        this.setState({viewType: e.target.value});
    }

    @bind()
    changeZipType(e) {
        this.setState({zip: e.target.checked});
    }

    render() {
        const {diff, viewType} = this.state;

        if (!diff) {
            return <div />;
        }

        return (
            <div className="app">
                <header className="config">
                    <div>
                        <Checkbox size="large" onChange={this.changeZipType}>Zip nearby sequences</Checkbox>
                    </div>
                    <div>
                        <RadioGroup size="large" value={viewType} onChange={this.switchViewType}>
                            <RadioButton value="split">Split</RadioButton>
                            <RadioButton value="unified">Unified</RadioButton>
                        </RadioGroup>
                    </div>
                </header>
                <div className="main">
                    {diff.map((file, i) => <File key={i} {...file} viewType={viewType} />)}
                </div>
            </div>
        );
    }
}
