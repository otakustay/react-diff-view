import {PureComponent} from 'react';
import parsePath from 'path-parse';
import {languages} from 'lang-map';
import {map, filter, without, sumBy, noop} from 'lodash';
import {bind} from 'lodash-decorators';
import {Whether, Else} from 'react-whether';
import Diff from '../src';
import LargeDiff from './LargeDiff';
import CommentWidget from './CommentWidget';
import highlight from './highlight';
import './File.css';
import Unfold from './Unfold.svg';

const renderChunkHeader = ({content}) => [
    <Unfold className="unfold" />,
    content
];

export default class File extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            ...this.computeState(props),
            comments: [],
            writingChanges: [],
            selectedChanges: [],
            diffEvents: {
                code: {
                    onDoubleClick: this.addComment
                }
            }
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.chunks !== this.props.chunks) {
            this.setState(this.computeState(nextProps));
        }
    }

    @bind()
    addComment(change) {
        const {writingChanges} = this.state;

        if (!writingChanges.includes(change)) {
            this.setState({writingChanges: [...writingChanges, change]});
        }
    }

    @bind()
    saveComment(change, content) {
        const {comments, writingChanges} = this.state;
        const patch = {
            comments: [...comments, {change, content}],
            writingChanges: without(writingChanges, change)
        };
        this.setState(patch);
    }

    @bind()
    selectChange(change, selected) {
        const {selectedChanges} = this.state;
        this.setState({selectedChanges: selected ? [...selectedChanges, change] : without(selectedChanges, change)});
    }

    computeState(props) {
        const {chunks} = props;
        const changeCount = sumBy(chunks, ({changes}) => changes.length);

        return {
            renderDiff: changeCount <= 800
        };
    }

    render() {
        const {from, to, additions, deletions, chunks, viewType} = this.props;
        const {renderDiff, diffEvents, comments, writingChanges, selectedChanges} = this.state;
        const filename = to === '/dev/null' ? from : to;
        const {ext = ''} = parsePath(filename);
        const [language] = languages(ext);
        const classNames = {
            code: `language-${language || 'unknown'}`
        };
        const changeCount = sumBy(chunks, ({changes}) => changes.length);
        const changesWithWidgets = [...map(comments, 'change'), ...writingChanges];
        const widgets = changesWithWidgets.reduce(
            (widgets, change) => {
                const lineComments = map(filter(comments, {change}), 'content');
                const writing = writingChanges.includes(change);
                const onSave = content => this.saveComment(change, content);
                return [
                    ...widgets,
                    {
                        change: change,
                        element: <CommentWidget comments={lineComments} writing={writing} onSave={onSave} />
                    }
                ];
            },
            []
        );

        return (
            <article className="diff-file">
                <header>
                    <strong className="filename">{filename}</strong>
                    <span className="addition-count">+++ {additions}</span>
                    <span className="deletion-count">--- {deletions}</span>
                </header>
                <main>
                    <Whether matches={renderDiff}>
                        <Diff
                            chunks={chunks}
                            widgets={widgets}
                            viewType={viewType}
                            renderChunkHeader={renderChunkHeader}
                            selectedChanges={selectedChanges}
                            customClassNames={classNames}
                            customEvents={diffEvents}
                            columnDiff={changeCount <= 200}
                            onRenderCode={changeCount <= 500 ? highlight : noop}
                            onSelect={this.selectChange}
                        />
                        <Else>
                            <LargeDiff onClick={() => this.setState({renderDiff: true})} />
                        </Else>
                    </Whether>
                </main>
            </article>
        );
    }
}
