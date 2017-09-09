import {PureComponent} from 'react';
import {without, sumBy, noop, pick} from 'lodash';
import {bind} from 'lodash-decorators';
import {Whether, Else} from 'react-whether';
import {Diff, Chunk, textLinesToChunk, insertChunk} from '../src';
import LargeDiff from './LargeDiff';
import CommentWidget from './CommentWidget';
import highlight from './highlight';
import './File.css';
import Unfold from './Unfold.svg';
import rawCode from './assets/ReactLink.raw';
import {
    createFilenameSelector,
    createCanExpandSelector,
    createCustomClassNamesSelector,
    createCustomEventsSelector,
    createRenderingChunksSelector,
    createWidgetsSelector
} from './selectors';

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

    computeFilename = createFilenameSelector();

    computeExpandable = createCanExpandSelector(this.computeFilename);

    computeClassNames = createCustomClassNamesSelector(this.computeFilename);

    computeEvents = createCustomEventsSelector(this.computeExpandable);

    computeRenderingChunks = createRenderingChunksSelector(this.computeExpandable);

    computeWidgets = createWidgetsSelector(this.createCommentWidget);

    constructor(props) {
        super(props);

        const {chunks} = props;
        const changeCount = sumBy(chunks, ({changes}) => changes.length);

        this.state = {
            chunks: this.computeRenderingChunks(props),
            renderDiff: changeCount <= 800,
            comments: [],
            writingChanges: [],
            selectedChanges: []
        };
    }

    @bind()
    createCommentWidget(change, comments, writing) {
        const onSave = content => this.saveComment(change, content);
        return <CommentWidget comments={comments} writing={writing} onSave={onSave} />;
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
        const lines = rawCode.split('\n');

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
        const {renderDiff, selectedChanges, chunks} = this.state;
        const methods = pick(this, ['addComment', 'selectChange', 'loadCollapsedBefore']);

        const changeCount = sumBy(chunks, ({changes}) => changes.length);
        const filename = this.computeFilename(this.props);
        const canExpand = this.computeExpandable(this.props);
        const customEvents = this.computeEvents({...this.props, ...methods});
        const customClassNames = this.computeClassNames(this.props);
        const widgets = this.computeWidgets(this.state);

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
                            widgets={widgets}
                            viewType={viewType}
                            selectedChanges={selectedChanges}
                            customClassNames={customClassNames}
                            customEvents={customEvents}
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
