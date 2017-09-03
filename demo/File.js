import {PureComponent} from 'react';
import parsePath from 'path-parse';
import {languages} from 'lang-map';
import {map, filter, without, sumBy, noop} from 'lodash';
import {bind} from 'lodash-decorators';
import {Whether, Else} from 'react-whether';
import {Diff, Chunk, addStubChunk, textLinesToChunk, insertChunk} from '../src';
import LargeDiff from './LargeDiff';
import CommentWidget from './CommentWidget';
import highlight from './highlight';
import './File.css';
import Unfold from './Unfold.svg';

const renderChunkHeader = (previousChunk, currentChunk) => {
    const isInitialChunk = currentChunk.oldStart === 1 && currentChunk.newStart === 1;

    if (isInitialChunk) {
        return null;
    }

    if (currentChunk.content === 'STUB') {
        return [
            <Unfold className="unfold" />,
            'Expand to file end'
        ];
    }

    const collapsedLines = previousChunk
        ? currentChunk.oldStart - previousChunk.oldStart - previousChunk.oldLines
        : currentChunk.oldStart - 1;
    return [
        <Unfold className="unfold" />,
        `Expand ${collapsedLines} lines of code`
    ];
};

const computeInitialFakeChunk = lines => ({oldStart: 1, oldLines: lines, newStart: 1});

export default class File extends PureComponent {

    constructor(props) {
        super(props);

        const {from, to, chunks} = props;
        const filename = to === '/dev/null' ? from : to;
        const canExpand = filename === 'src/addons/link/ReactLink.js';
        const changeCount = sumBy(chunks, ({changes}) => changes.length);
        const baseEvents = {
            code: {
                onDoubleClick: this.addComment
            },
            gutter: {
                onClick: this.selectChange
            }
        };
        const diffEvents = canExpand
            ? {
                ...baseEvents,
                gutterHeader: {
                    onClick: this.loadCollapsedBefore
                }
            }
            : baseEvents;

        this.state = {
            renderDiff: changeCount <= 800,
            chunks: canExpand ? addStubChunk(chunks) : chunks,
            filename: filename,
            canExpand: canExpand,
            comments: [],
            writingChanges: [],
            selectedChanges: [],
            diffEvents: diffEvents
        };
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
        const postTime = Date.now();
        const patch = {
            comments: [...comments, {change, content, postTime}],
            writingChanges: without(writingChanges, change)
        };
        this.setState(patch);
    }

    @bind()
    selectChange(change) {
        const {selectedChanges} = this.state;
        const selected = selectedChanges.includes(change);
        this.setState({selectedChanges: selected ? without(selectedChanges, change) : [...selectedChanges, change]});
    }

    @bind()
    async loadCollapsedBefore(chunk) {
        const response = await fetch('assets/ReactLink.js');
        const text = await response.text();
        const lines = text.split('\n');

        if (chunk.content === 'STUB') {
            this.expandTailCode(lines, chunk);
        }
        else {
            this.expandInsertionCode(lines, chunk);
        }
    }

    expandInsertionCode(rawCodeLines, chunk) {
        const {chunks} = this.state;
        const previousChunk = chunks[chunks.indexOf(chunk) - 1] || computeInitialFakeChunk(chunk.oldStart - 1);
        const collapsedLines = rawCodeLines.slice(previousChunk.oldStart - 1, chunk.oldStart - 1);
        const collapsedChunk = textLinesToChunk(collapsedLines, previousChunk.oldStart, previousChunk.newStart);
        const newChunks = insertChunk(chunks, collapsedChunk);
        this.setState({chunks: newChunks});
    }

    expandTailCode(rawCodeLines, stubChunk) {
        const {chunks} = this.state;
        const collapsedLines = rawCodeLines.slice(stubChunk.oldStart - 1, rawCodeLines.length);
        const chunksWithoutStub = chunks.slice(0, -1);
        if (!collapsedLines.length) {
            this.setState({chunks: chunksWithoutStub});
        }
        else {
            const collapsedChunk = textLinesToChunk(collapsedLines, stubChunk.oldStart, stubChunk.newStart);
            const newChunks = insertChunk(chunksWithoutStub, collapsedChunk);
            this.setState({chunks: newChunks});
        }
    }

    render() {
        const {additions, deletions, viewType} = this.props;
        const {
            filename,
            canExpand,
            chunks,
            renderDiff,
            diffEvents,
            comments,
            writingChanges,
            selectedChanges
        } = this.state;
        const {ext = ''} = parsePath(filename);
        const [language] = languages(ext);
        const classNames = {
            code: `language-${language || 'unknown'}`
        };
        const changeCount = sumBy(chunks, ({changes}) => changes.length);
        const changesWithWidgets = [...map(comments, 'change'), ...writingChanges];
        const widgets = changesWithWidgets.reduce(
            (widgets, change) => {
                const lineComments = filter(comments, {change});
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

        const renderChunk = (children, chunk) => {
            const header = canExpand ? renderChunkHeader(children[children.length - 1], chunk) : undefined;
            children.push(<Chunk key={chunk.content} chunk={chunk} header={header} />);
            return children;
        };

        return (
            <article className="diff-file">
                <header className="diff-file-header">
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
                            selectedChanges={selectedChanges}
                            customClassNames={classNames}
                            customEvents={diffEvents}
                            columnDiff={changeCount <= 200}
                            onRenderCode={changeCount <= 500 ? highlight : noop}
                        >
                            {chunks.reduce(renderChunk, [])}
                        </Diff>
                        <Else>
                            <LargeDiff onClick={() => this.setState({renderDiff: true})} />
                        </Else>
                    </Whether>
                </main>
            </article>
        );
    }
}
