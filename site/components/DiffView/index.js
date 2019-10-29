import {useCallback} from 'react';
import {Tooltip} from 'antd';
import {
    Diff,
    Hunk,
    useSourceExpansion,
    useMinCollapsedLines,
    useChangeSelect,
    useTokenizeWorker,
} from 'react-diff-view';
import {useConfiguration} from '../../context/configuration';
import HunkInfo from './HunkInfo';
import UnfoldCollapsed from './UnfoldCollapsed';
import TokenizeWorker from './Tokenize.worker'; // eslint-disable-line import/default
import c from './index.less';
import './diff.global.less';
import './syntax.global.less';

const tokenize = new TokenizeWorker();

const stopPropagation = e => e.stopPropagation();

const useEnhance = (hunks, oldSource, {language, editsType}) => {
    const [hunksWithSourceExpanded, expandRange] = useSourceExpansion(hunks, oldSource);
    const hunksWithMinLinesCollapsed = useMinCollapsedLines(5, hunksWithSourceExpanded, oldSource);
    const [selection, toggleSelection] = useChangeSelect(hunksWithMinLinesCollapsed, {multiple: true});
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
};

const DiffView = props => {
    const {oldSource, type} = props;
    const configuration = useConfiguration();
    const {
        expandRange,
        selection,
        toggleSelection,
        hunks,
        tokens,
    } = useEnhance(props.hunks, oldSource, configuration);
    const {viewType, showGutter} = configuration;
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
                    onExpand={expandRange}
                />
            )
            : <HunkInfo key={'decoration-' + hunk.content} hunk={hunk} />;
        children.push(decorationElement);
        const events = {
            onClick: toggleSelection,
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
            oldSource={oldSource}
            gutterType={showGutter ? 'default' : 'none'}
            selectedChanges={selection}
            tokens={tokens}
            renderGutter={renderGutter}
        >
            {hunks => hunks.reduce(renderHunk, [])}
        </Diff>
    );
};

export default DiffView;
