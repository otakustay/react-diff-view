import {useCallback} from 'react';
import {Tooltip} from 'antd';
import {
    Diff,
    Hunk,
    withSourceExpansion,
    minCollapsedLines,
    withChangeSelect,
    withTokenizeWorker,
} from 'react-diff-view';
import {compose} from 'recompose';
import 'prism-themes/themes/prism-vs.css';
import HunkInfo from './HunkInfo';
import UnfoldCollapsed from './UnfoldCollapsed';
import TokenizeWorker from './Tokenize.worker'; // eslint-disable-line import/default
import c from './index.css';

const tokenize = new TokenizeWorker();

const stopPropagation = e => e.stopPropagation();

const DiffView = props => {
    const {
        hunks,
        oldSource,
        type,
        showGutter,
        viewType,
        selectedChanges,
        tokens,
        onExpandRange,
        onToggleChangeSelection,
    } = props;
    const renderGutter = useCallback(
        ({change, side, inHoverState, renderDefault, wrapInAnchor}) => {
            const canComment = inHoverState && (viewType === 'split' || side === 'new');
            if (canComment) {
                return (
                    <Tooltip
                        title={
                            <>
                                Comment on line {renderDefault()}
                                <br />
                                {change.content.slice(0, 10)}...
                                <br />
                                Not implemented yet
                            </>
                        }
                    >
                        <span className={c.commentTrigger} onClick={stopPropagation}>+</span>
                    </Tooltip>
                );
            }

            return wrapInAnchor(renderDefault());
        },
        [viewType]
    );
    const linesCount = oldSource ? oldSource.split('\n').length : 0;
    const renderHunk = (children, hunk, i, hunks) => {
        const previousElement = children[children.length - 1];
        const decorationElement = oldSource
            ? (
                <UnfoldCollapsed
                    key={'decoration-' + hunk.content}
                    previousHunk={previousElement && previousElement.props.hunk}
                    currentHunk={hunk}
                    linesCount={linesCount}
                    onExpand={onExpandRange}
                />
            )
            : <HunkInfo key={'decoration-' + hunk.content} hunk={hunk} />;
        children.push(decorationElement);
        const events = {
            onClick: onToggleChangeSelection,
        };

        const hunkElement = (
            <Hunk
                key={'hunk-' + hunk.content}
                hunk={hunk}
                codeEvents={events}
                gutterEvents={events}
            />
        );
        children.push(hunkElement);

        if (i === hunks.length - 1 && oldSource) {
            const unfoldTailElement = (
                <UnfoldCollapsed
                    key="decoration-tail"
                    previousHunk={hunk}
                    linesCount={linesCount}
                    onExpand={onExpandRange}
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
            oldSource={oldSource}
            gutterType={showGutter ? 'default' : 'none'}
            selectedChanges={selectedChanges}
            tokens={tokens}
            renderGutter={renderGutter}
        >
            {hunks => hunks.reduce(renderHunk, [])}
        </Diff>
    );
};

const tokenizeOptions = {
    mapPayload(data, {editsType}) {
        return {
            ...data,
            editsType: editsType,
        };
    },
};

const enhance = compose(
    withSourceExpansion(),
    minCollapsedLines(5),
    withChangeSelect({multiple: true}),
    withTokenizeWorker(tokenize, tokenizeOptions)
);

export default enhance(DiffView);
