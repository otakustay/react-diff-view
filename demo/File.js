import {PureComponent} from 'react';
import {without, sumBy, noop, pick} from 'lodash';
import {bind} from 'lodash-decorators';
import {Whether, Else} from 'react-whether';
import {Diff, Hunk, textLinesToHunk, insertHunk} from '../src';
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
    createRenderingHunksSelector,
    createWidgetsSelector
} from './selectors';

const renderHunkHeader = (previousHunk, currentHunk) => {
    const isInitialHunk = currentHunk.oldStart === 1 && currentHunk.newStart === 1;

    if (isInitialHunk) {
        return null;
    }

    if (currentHunk.content === 'STUB') {
        return [
            <Unfold className="unfold" />,
            'Expand to file end'
        ];
    }

    const collapsedLines = previousHunk
        ? currentHunk.oldStart - previousHunk.oldStart - previousHunk.oldLines
        : currentHunk.oldStart - 1;
    return [
        <Unfold className="unfold" />,
        `Expand ${collapsedLines} lines of code`
    ];
};

const computeInitialFakeHunk = lines => ({oldStart: 1, oldLines: lines, newStart: 1});

export default class File extends PureComponent {

    computeFilename = createFilenameSelector();

    computeExpandable = createCanExpandSelector(this.computeFilename);

    computeClassNames = createCustomClassNamesSelector(this.computeFilename);

    computeEvents = createCustomEventsSelector(this.computeExpandable);

    computeRenderingHunks = createRenderingHunksSelector(this.computeExpandable);

    computeWidgets = createWidgetsSelector(this.createCommentWidget);

    constructor(props) {
        super(props);

        const {hunks} = props;
        const changeCount = sumBy(hunks, ({changes}) => changes.length);

        this.state = {
            hunks: this.computeRenderingHunks(props),
            renderDiff: changeCount <= 800,
            comments: [],
            writingChanges: [],
            selectedChanges: []
        };
    }

    componentWillReceiveProps(nextProps) {
        const currentHunks = this.computeRenderingHunks(this.props);
        const nextHunks = this.computeRenderingHunks(nextProps);

        if (currentHunks !== nextHunks) {
            const patch = {
                hunks: nextHunks,
                comments: [],
                writingChanges: [],
                selectedChanges: []
            };
            this.setState(patch);
        }
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
    async loadCollapsedBefore(hunk) {
        const lines = rawCode.split('\n');

        if (hunk.content === 'STUB') {
            this.expandTailCode(lines, hunk);
        }
        else {
            this.expandInsertionCode(lines, hunk);
        }
    }

    expandInsertionCode(rawCodeLines, hunk) {
        const {hunks} = this.state;
        const previousHunk = hunks[hunks.indexOf(hunk) - 1] || computeInitialFakeHunk(hunk.oldStart - 1);
        const collapsedLines = rawCodeLines.slice(previousHunk.oldStart - 1, hunk.oldStart - 1);
        const collapsedHunk = textLinesToHunk(collapsedLines, previousHunk.oldStart, previousHunk.newStart);
        const newHunks = insertHunk(hunks, collapsedHunk);
        this.setState({hunks: newHunks});
    }

    expandTailCode(rawCodeLines, stubHunk) {
        const {hunks} = this.state;
        const collapsedLines = rawCodeLines.slice(stubHunk.oldStart - 1, rawCodeLines.length);
        const hunksWithoutStub = hunks.slice(0, -1);
        if (!collapsedLines.length) {
            this.setState({hunks: hunksWithoutStub});
        }
        else {
            const collapsedHunk = textLinesToHunk(collapsedLines, stubHunk.oldStart, stubHunk.newStart);
            const newHunks = insertHunk(hunksWithoutStub, collapsedHunk);
            this.setState({hunks: newHunks});
        }
    }

    render() {
        const {type, additions, deletions, viewType} = this.props;
        const {renderDiff, selectedChanges, hunks} = this.state;
        const methods = pick(this, ['addComment', 'selectChange', 'loadCollapsedBefore']);
        const changeCount = sumBy(hunks, ({changes}) => changes.length);
        const filename = this.computeFilename(this.props);
        const canExpand = this.computeExpandable(this.props);
        const customEvents = this.computeEvents({...this.props, ...methods});
        const customClassNames = this.computeClassNames(this.props);
        const widgets = this.computeWidgets(this.state);

        const renderHunk = (children, hunk) => {
            const header = canExpand ? renderHunkHeader(children[children.length - 1], hunk) : undefined;
            children.push(<Hunk key={hunk.content} hunk={hunk} header={header} />);
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
                            diffType={type}
                            widgets={widgets}
                            viewType={viewType}
                            selectedChanges={selectedChanges}
                            customClassNames={customClassNames}
                            customEvents={customEvents}
                            columnDiff={changeCount <= 200}
                            onRenderCode={changeCount <= 500 ? highlight : noop}
                        >
                            {hunks.reduce(renderHunk, [])}
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
