import {PureComponent} from 'react';
import {uniqueId} from 'lodash';
import {bind} from 'lodash-decorators';
import {Button, Radio, Checkbox} from 'antd';
import 'antd/dist/antd.css';
import InfiniteScroll from 'react-infinite-scroller';
import File from './File';
import './App.css';
import ParseWorker from './parse';

const ButtonGroup = Button.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

/* eslint-disable no-console */

export default class App extends PureComponent {

    state = {
        zip: false,
        diff: [],
        rendering: [],
        diffText: '',
        viewType: 'split'
    };

    constructor(props) {
        super(props);

        this.parser = new ParseWorker();
        this.parser.addEventListener(
            'message',
            ({data: {jobID, diff}}) => {
                if (jobID === this.state.jobID) {
                    this.setState({diff: diff, rendering: diff.slice(0, 1)});
                }
            }
        );
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.diff !== this.state.diff) {
            console.timeEnd('parse');
            console.time('render');
        }
    }

    /* eslint-disable react/no-did-update-set-state */
    componentDidUpdate(prevProps, prevState) {
        if (prevState.zip !== this.state.zip || prevState.diffText !== this.state.diffText) {
            const {zip, diffText} = this.state;
            const nearbySequences = zip ? 'zip' : null;

            console.time('parse');
            const jobID = uniqueId();
            this.parser.postMessage({jobID, diffText, nearbySequences});
            this.setState({jobID});
        }

        if (prevState.diff !== this.state.diff) {
            console.timeEnd('render');
            console.time('paint');
            requestAnimationFrame(() => requestAnimationFrame(() => console.timeEnd('paint')));
        }
    }
    /* eslint-enable react/no-did-update-set-state */

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

    @bind()
    loadMoreFile() {
        const {diff, rendering} = this.state;
        this.setState({rendering: diff.slice(0, rendering.length + 1)});
    }

    render() {
        const {diff, rendering, viewType} = this.state;

        /* eslint-disable react/jsx-no-bind, react/no-array-index-key */
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
                                Medium preset (slow)
                            </Button>
                            <Button
                                className="preset"
                                onClick={() => this.loadPreset('large')}
                                size="large"
                            >
                                Large preset (very slow)
                            </Button>
                        </ButtonGroup>
                    </div>
                </header>
                <div className="diff-input">
                    <textarea onChange={this.receiveNewDiff} placeholder="Paste diff content here" />
                </div>
                <div className="main">
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={this.loadMoreFile}
                        hasMore={diff.length > rendering.length}
                    >
                        {rendering.map((file, i) => <File key={i} {...file} viewType={viewType} />)}
                    </InfiniteScroll>
                </div>
            </div>
        );
        /* eslint-enable react/jsx-no-bind, react/no-array-index-key */
    }
}
