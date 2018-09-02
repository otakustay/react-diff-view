import {Component} from 'react';
import {wrapDisplayName} from 'recompose';
import {createSelector, expandCollapsedBlockBy} from '../utils';

const expandCollapsedUnder = minLinesExclusive => {
    const predicate = lines => lines < minLinesExclusive;

    return (hunks, oldSource) => expandCollapsedBlockBy(hunks, oldSource, predicate);
};

export default minLinesExclusive => ComponentIn => class ComponentOut extends Component {

    static displayName = wrapDisplayName(ComponentIn, 'minCollapsedLines');

    expandSmallCollapsedBlocks = createSelector(expandCollapsedUnder(minLinesExclusive));

    render() {
        const {hunks, oldSource} = this.props;

        if (!oldSource) {
            return <ComponentIn {...this.props} />;
        }

        const renderingHunks = this.expandSmallCollapsedBlocks(hunks, oldSource);

        return <ComponentIn {...this.props} hunks={renderingHunks} />;
    }
};
