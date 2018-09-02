import {PureComponent} from 'react';
import {uniqueId, without, omit} from 'lodash';
import {bind} from 'lodash-decorators';
import sha from 'sha1';
import shallowEquals from 'shallow-equal/objects';
import {parseDiff, Diff, Hunk, expandFromRawCode, getChangeKey} from 'react-diff-view';
import {withTransientRegion} from 'react-kiss';
import 'prism-themes/themes/prism-vs.css';
import HunkInfo from './HunkInfo';
import UnfoldCollapsed from './UnfoldCollapsed';
import TokenizeWorker from './Tokenize.worker'; // eslint-disable-line import/default
import './index.css';

const fakeIndex = () => sha(uniqueId()).slice(0, 9);

const tokenize = new TokenizeWorker();

class DiffView extends PureComponent {

    state = {
        tokens: null
    };

    jobID = null;

    componentDidMount() {
        tokenize.addEventListener('message', this.receiveTokens);
        this.tokenize();
    }

    componentWillUnmount() {
        tokenize.removeEventListener('message', this.receiveTokens);
    }

    componentDidUpdate(prevProps) {
        const currentTokenizeContext = omit(this.props, 'selection');
        const nextTokenizeContext = omit(prevProps, 'selection');
        if (!shallowEquals(currentTokenizeContext, nextTokenizeContext)) {
            this.tokenize();
        }
    }

    tokenize() {
        const {hunks, oldSource, editsType, language} = this.props;
        this.jobID = uniqueId();
        const data = {
            id: this.jobID,
            language: language,
            oldSource: oldSource,
            editsType: editsType,
            hunks: hunks
        };
        tokenize.postMessage(data);
    }

    @bind()
    receiveTokens({data: {tokens, id}}) {
        if (id === this.jobID) {
            this.setState({tokens});
        }
    }

    render() {
        const {
            hunks,
            type,
            showGutter,
            rawCodeLines,
            viewType,
            selection,
            onLoadCollapsedCode,
            onToggleChangeSelection
        } = this.props;
        const {tokens} = this.state;
        const renderHunk = (children, hunk, i, hunks) => {
            const previousElement = children[children.length - 1];
            const decorationElement = rawCodeLines
                ? (
                    <UnfoldCollapsed
                        key={'decoration-' + hunk.content}
                        previousHunk={previousElement && previousElement.props.hunk}
                        currentHunk={hunk}
                        rawCodeLines={rawCodeLines}
                        onExpand={onLoadCollapsedCode}
                    />
                )
                : <HunkInfo key={'decoration-' + hunk.content} hunk={hunk} />;
            children.push(decorationElement);

            const hunkElement = (
                <Hunk
                    key={'hunk-' + hunk.content}
                    hunk={hunk}
                    codeEvents={{onClick: onToggleChangeSelection}}
                    gutterEvents={{onClick: onToggleChangeSelection}}
                />
            );
            children.push(hunkElement);

            if (i === hunks.length - 1 && rawCodeLines) {
                const unfoldTailElement = (
                    <UnfoldCollapsed
                        key="decoration-tail"
                        previousHunk={hunk}
                        rawCodeLines={rawCodeLines}
                        onExpand={onLoadCollapsedCode}
                    />
                );
                children.push(unfoldTailElement);
            }

            return children;
        };

        return (
            <Diff
                viewType={viewType}
                diffType={type}
                hunks={hunks}
                gutterType={showGutter ? 'default' : 'none'}
                selectedChanges={selection}
                tokens={tokens}
            >
                {hunks => hunks.reduce(renderHunk, [])}
            </Diff>
        );
    }
}

const initialState = ({diff, source}) => {
    const segments = [
        'diff --git a/a b/b',
        `index ${fakeIndex()}..${fakeIndex()} 100644`,
        diff
    ];

    const files = parseDiff(segments.join('\n'), {nearbySequences: 'zip'});

    return {
        ...files[0],
        oldSource: source,
        rawCodeLines: source && source.split('\n'),
        selection: []
    };
};

const workflows = {
    onLoadCollapsedCode({start, end}, {hunks, rawCodeLines}) {
        const newHunks = expandFromRawCode(hunks, rawCodeLines, start, end);
        return {hunks: newHunks};
    },

    onToggleChangeSelection({change}) {
        const key = getChangeKey(change);
        const toggle = selection => {
            if (selection.includes(key)) {
                return without(selection, key);
            }

            return selection.concat(key);
        };

        return state => ({selection: toggle(state.selection)});
    }
};

export default withTransientRegion(initialState, workflows)(DiffView);
