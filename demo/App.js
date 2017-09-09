import {PureComponent} from 'react';
import {bind} from 'lodash-decorators';
import {Button, Radio, Checkbox} from 'antd';
import 'antd/dist/antd.css';
import {parseDiff} from '../src';
import File from './File';
import './App.css';
import Perf from 'react-addons-perf';
window.Perf = Perf;

const ButtonGroup = Button.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

/* eslint-disable no-console */

export default class App extends PureComponent {

    state = {
        zip: false,
        diff: [],
        diffText: '',
        viewType: 'split'
    };

    componentWillUpdate(nextProps, nextState) {
        if (nextState.diff !== this.state.diff) {
            console.time('render');
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.zip !== this.state.zip || prevState.diffText !== this.state.diffText) {
            const {zip, diffText} = this.state;
            const nearbySequences = zip ? 'zip' : null;
            console.time('parse');
            const diff = parseDiff(diffText, {nearbySequences});
            console.timeEnd('parse');
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

    @bind()
    receiveNewDiff(e) {
        this.setState({diffText: e.target.value});
    }

    async loadPreset(type) {
        const response = await fetch(`assets/${type}.diff`);
        const diffText = await response.text();
        this.setState({diffText});
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
                    <div>
                        <ButtonGroup>
                            <Button
                                className="preset"
                                onClick={() => this.loadPreset('small')}
                                size="large"
                            >
                                Small preset
                            </Button>
                            <Button
                                className="preset"
                                onClick={() => this.loadPreset('medium')}
                                size="large"
                            >
                                Medium preset (slow
                            )</Button>
                            <Button
                                className="preset"
                                onClick={() => this.loadPreset('large')}
                                size="large"
                            >
                                Large preset (very slow
                            )</Button>
                        </ButtonGroup>
                    </div>
                </header>
                <div className="diff-input">
                    <textarea onChange={this.receiveNewDiff} placeholder="Paste diff content here" />
                </div>
                <div className="main">
                    {diff.map((file, i) => <File key={i} {...file} viewType={viewType} />)}
                </div>
            </div>
        );
    }
}
