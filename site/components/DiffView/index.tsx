import {ReactElement, useCallback, useMemo, useState} from 'react';
import {nanoid} from 'nanoid';
import {
    Diff,
    Hunk,
    useSourceExpansion,
    useMinCollapsedLines,
    useTokenizeWorker,
    HunkData,
    MarkEditsType,
    DiffType,
    GutterOptions,
    EventMap,
} from 'react-diff-view';
import 'react-diff-view/styles/index.css';
import {useConfiguration} from '../../context/configuration';
import HunkInfo from './HunkInfo';
import UnfoldCollapsed from './UnfoldCollapsed';
import CommentTrigger from './CommentTrigger';
import Comment from './Comment';
import TokenizeWorker from './Tokenize?worker';
import './diff.global.less';
import './syntax.global.less';
import {useSelection} from '../../hooks/selection';

const tokenize = new TokenizeWorker();

interface EnhanceOptions {
    language: string;
    editsType: MarkEditsType;
}

function useEnhance(hunks: HunkData[], oldSource: string | null, {language, editsType}: EnhanceOptions) {
    const [hunksWithSourceExpanded, expandRange] = useSourceExpansion(hunks, oldSource);
    const hunksWithMinLinesCollapsed = useMinCollapsedLines(0, hunksWithSourceExpanded, oldSource);
    const [selection, toggleSelection] = useSelection(hunksWithMinLinesCollapsed);
    const tokenizePayload = {
        oldSource,
        language,
        editsType,
        hunks: hunksWithMinLinesCollapsed,
    };
    const {tokens} = useTokenizeWorker(tokenize, tokenizePayload);
    return {
        expandRange,
        selection,
        toggleSelection,
        tokens,
        hunks: hunksWithMinLinesCollapsed,
    };
}

interface CommentData {
    id: string;
    changeKey: string;
    state: 'create' | 'edit' | 'display';
    content: string;
    time: Date;
}

function useComments() {
    const [comments, setComments] = useState<CommentData[]>([]);
    const addComment = useCallback(
        (changeKey: string) => {
            const addNew = (state: CommentData[]): CommentData[] => [
                ...state,
                {changeKey, id: nanoid(), state: 'create', content: '', time: new Date()},
            ];
            setComments(addNew);
        },
        []
    );
    const editComment = useCallback(
        (commentId: string) => {
            const mayUpdate = (comment: CommentData): CommentData => {
                if (comment.id !== commentId) {
                    return comment;
                }

                return {...comment, state: 'edit'};
            };
            setComments(s => s.map(mayUpdate));
        },
        []
    );
    const saveEdit = useCallback(
        (commentId: string, content: string) => {
            const mayUpdate = (comment: CommentData): CommentData => {
                if (comment.id !== commentId) {
                    return comment;
                }

                return {...comment, content, state: 'display', time: new Date()};
            };
            setComments(s => s.map(mayUpdate));
        },
        []
    );
    const cancelEdit = useCallback(
        (commentId: string) => {
            const mayUpdate = (comment: CommentData): CommentData => {
                if (comment.id !== commentId) {
                    return comment;
                }

                return {...comment, state: 'display'};
            };
            setComments(s => s.map(mayUpdate));
        },
        []
    );
    const deleteComment = useCallback(
        (commentId: string) => setComments(s => s.filter(v => v.id !== commentId)),
        []
    );

    return [comments, {addComment, editComment, saveEdit, cancelEdit, deleteComment}] as const;
}

interface Props {
    oldSource: string | null;
    type: DiffType;
    hunks: HunkData[];
}

export default function DiffView(props: Props) {
    const {oldSource, type} = props;
    const configuration = useConfiguration();
    const {
        expandRange,
        selection,
        toggleSelection,
        hunks,
        tokens,
    } = useEnhance(props.hunks, oldSource, configuration);
    const [comments, {addComment, editComment, saveEdit, cancelEdit, deleteComment}] = useComments();
    const widgets = useMemo(
        () => comments.reduce<Record<string, ReactElement[]>>(
            (widgets, comment) => {
                if (!widgets[comment.changeKey]) {
                    // eslint-disable-next-line no-param-reassign
                    widgets[comment.changeKey] = [];
                }
                widgets[comment.changeKey].push(
                    <Comment
                        key={comment.id}
                        id={comment.id}
                        content={comment.content}
                        state={comment.state}
                        time={comment.time}
                        onSave={saveEdit}
                        onEdit={editComment}
                        onCancel={cancelEdit}
                        onDelete={deleteComment}
                    />
                );
                return widgets;
            },
            {}
        ),
        [comments, saveEdit, editComment, cancelEdit, deleteComment]
    );
    const {viewType, showGutter} = configuration;
    const renderGutter = useCallback(
        ({change, side, inHoverState, renderDefault, wrapInAnchor}: GutterOptions) => {
            const canComment = inHoverState && (viewType === 'split' || side === 'new');
            if (canComment) {
                return <CommentTrigger change={change} onClick={addComment} />;
            }

            return wrapInAnchor(renderDefault());
        },
        [addComment, viewType]
    );
    const events: EventMap = {
        onClick: toggleSelection,
    };
    const linesCount = oldSource ? oldSource.split('\n').length : 0;
    const renderHunk = (children: ReactElement[], hunk: HunkData, i: number, hunks: HunkData[]) => {
        const previousElement = children[children.length - 1];
        const decorationElement = oldSource
            ? (
                <UnfoldCollapsed
                    key={`decoration-${hunk.content}`}
                    previousHunk={previousElement && previousElement.props.hunk}
                    currentHunk={hunk}
                    linesCount={linesCount}
                    onExpand={expandRange}
                />
            )
            : <HunkInfo key={`decoration-${hunk.content}`} hunk={hunk} />;
        children.push(decorationElement);

        const hunkElement = (
            <Hunk
                key={`hunk-${hunk.content}`}
                hunk={hunk}
            />
        );
        children.push(hunkElement);

        if (i === hunks.length - 1 && oldSource) {
            const unfoldTailElement = (
                <UnfoldCollapsed
                    key="decoration-tail"
                    previousHunk={hunk}
                    linesCount={linesCount}
                    onExpand={expandRange}
                />
            );
            children.push(unfoldTailElement);
        }

        return children;
    };

    return (
        <Diff
            optimizeSelection
            viewType={viewType}
            diffType={type}
            hunks={hunks}
            gutterType={showGutter ? 'default' : 'none'}
            selectedChanges={selection}
            tokens={tokens}
            widgets={widgets}
            codeEvents={events}
            gutterEvents={events}
            renderGutter={renderGutter}
        >
            {hunks => hunks.reduce(renderHunk, [])}
        </Diff>
    );
}
