import {Component} from 'react';
import {wrapDisplayName} from 'recompose';
import {expandFromRawCode, createSelector} from '../utils';

const expandRangesFromHunks = (hunks, oldSource, expandRanges) => {
    const linesOfOldSource = oldSource.split('\n');

    return expandRanges.reduce(
        (hunks, [start, end]) => expandFromRawCode(hunks, linesOfOldSource, start, end),
        hunks
    );
};

export default () => ComponentIn => class ComponentOut extends Component {

    static displayName = wrapDisplayName(ComponentIn, 'withSourceExpansion');

    state = {
        expandRanges: [],
        prevProps: {}
    };

    computeExpandedHunks = createSelector(expandRangesFromHunks);

    static getDerivedStateFromProps(nextProps, {prevProps}) {
        if (nextProps.hunks === prevProps.hunks && nextProps.oldSource === prevProps.oldSource) {
            return null;
        }

        return {
            expandRanges: [],
            prevProps: {
                hunks: nextProps.hunks,
                oldSource: nextProps.oldSource
            }
        };
    }

    expandRange = (start, end) => {
        const appendRange = state => ({expandRanges: [...state.expandRanges, [start, end]]});
        this.setState(appendRange);
    };

    render() {
        const {hunks, oldSource} = this.props;

        if (!oldSource) {
            return <ComponentIn {...this.props} />;
        }

        const {expandRanges} = this.state;
        const renderingHunks = this.computeExpandedHunks(hunks, oldSource, expandRanges);

        return (
            <ComponentIn
                {...this.props}
                hunks={renderingHunks}
                onExpandRange={this.expandRange}
            />
        );
    }
};
