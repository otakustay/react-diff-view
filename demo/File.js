import {PureComponent} from 'react';
import {without, sumBy, noop, pick, union, last} from 'lodash';
import {bind} from 'lodash-decorators';
import {Whether, Else} from 'react-whether';
import hash from 'short-hash';
import {Diff, Hunk, expandFromRawCode, addStubHunk, getChangeKey, markCharacterEdits} from '../src';
import HunkHeader from './HunkHeader';
import LargeDiff from './LargeDiff';
import CommentWidget from './CommentWidget';
import highlight from './highlight';
import './File.css';
import rawCode from './assets/CSSPropertyOperations.raw';
import {
    createFilenameSelector,
    createCanExpandSelector,
    createCustomClassNamesSelector,
    createCustomEventsSelector,
    createRenderingHunksSelector,
    createWidgetsSelector
} from './selectors';

/* eslint-disable react/jsx-no-bind */

const rawCodeLines = rawCode.trim().split('\n');

const markEdits = markCharacterEdits({threshold: 30, markLongDistanceDiff: true});

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
        const filename = this.computeFilename(this.props);
        const idPrefix = hash(filename);

        this.state = {
            hunks: this.computeRenderingHunks(props),
            renderDiff: changeCount <= 800,
            comments: [],
            writingChanges: [],
            selectedChanges: [],
            generateAnchorID(change) {
                return idPrefix + '-' + getChangeKey(change);
            }
        };
    }

    componentWillReceiveProps(nextProps) {
        const currentHunks = this.computeRenderingHunks(this.props);
        const nextHunks = this.computeRenderingHunks(nextProps);

        if (currentHunks !== nextHunks) {
            const patch = {
                hunks: nextHunks,
                comments: {},
                writingChanges: [],
                selectedChanges: []
            };
            this.setState(patch);
        }
    }

    @bind()
    createCommentWidget(changeKey, comments, writing) {
        const onSave = content => this.saveComment(changeKey, content);
        return <CommentWidget comments={comments} writing={writing} onSave={onSave} />;
    }

    @bind()
    addComment(change) {
        const {writingChanges} = this.state;
        const key = getChangeKey(change);

        if (!writingChanges.includes(key)) {
            this.setState({writingChanges: [...writingChanges, key]});
        }
    }

    @bind()
    saveComment(changeKey, content) {
        const {comments, writingChanges} = this.state;
        const postTime = Date.now();
        const previousComments = comments[changeKey] || [];

        const patch = {
            comments: {
                ...comments,
                [changeKey]: [...previousComments, {content, postTime}]
            },
            writingChanges: without(writingChanges, changeKey)
        };
        this.setState(patch);
    }

    @bind()
    selectChange(change) {
        const {selectedChanges} = this.state;
        const key = getChangeKey(change);
        this.setState({selectedChanges: union(selectedChanges, [key])});
    }

    @bind()
    loadCollapsedCode(start, end) {
        const {hunks} = this.state;
        const hunksWithoutStub = last(hunks).content === 'STUB' ? hunks.slice(0, -1) : hunks;
        const newHunks = expandFromRawCode(hunksWithoutStub, rawCodeLines, start, end);
        const newHunksWithStub = addStubHunk(newHunks, rawCodeLines);
        this.setState({hunks: newHunksWithStub});
    }

    render() {
        const {type, additions, deletions, viewType} = this.props;
        const {renderDiff, selectedChanges, hunks, generateAnchorID} = this.state;
        const methods = pick(this, ['addComment', 'selectChange', 'loadCollapsedBefore']);
        const changeCount = sumBy(hunks, ({changes}) => changes.length);
        const filename = this.computeFilename(this.props);
        const canExpand = this.computeExpandable(this.props);
        const customEvents = this.computeEvents({...this.props, ...methods});
        const customClassNames = this.computeClassNames(this.props);
        const widgets = this.computeWidgets(this.state);

        const renderHunk = (children, hunk) => {
            const previousElement = children[children.length - 1];
            const header = canExpand
                ? (
                    <HunkHeader
                        previousHunk={previousElement && previousElement.props.hunk}
                        currentHunk={hunk}
                        rawCodeLines={rawCodeLines}
                        onExpand={this.loadCollapsedCode}
                    />
                )
                : undefined;
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
                            gutterAnchor
                            diffType={type}
                            widgets={widgets}
                            viewType={viewType}
                            selectedChanges={selectedChanges}
                            customClassNames={customClassNames}
                            customEvents={customEvents}
                            markEdits={changeCount <= 200 ? markEdits : undefined}
                            onRenderCode={changeCount <= 50000 ? highlight : noop}
                            generateAnchorID={generateAnchorID}
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
