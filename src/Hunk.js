import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import UnifiedHunk from './UnifiedHunk';
import SplitHunk from './SplitHunk';
import {createHunkEventsSelector, createHunkClassNamesSelector} from './selectors';
import {viewTypePropType, eventsPropType, hunkPropType} from './propTypes';
import './Hunk.css';

export default class Hunk extends PureComponent {

    static propTypes = {
        viewType: viewTypePropType,
        hunk: hunkPropType.isRequired,
        header: PropTypes.oneOfType([PropTypes.node, PropTypes.shape([PropTypes.node, PropTypes.node])]),
        widgets: PropTypes.objectOf(PropTypes.element),
        selectedChanges: PropTypes.arrayOf(PropTypes.string),
        customEvents: eventsPropType
    };

    static defaultProps = {
        viewType: 'split',
        header: undefined,
        widgets: {},
        selectedChanges: [],
        customEvents: {}
    };

    selectEvents = createHunkEventsSelector();

    selectClassNames = createHunkClassNamesSelector();

    render() {
        const {viewType, customEvents, customClassNames, ...props} = this.props;
        const RenderingHunk = viewType === 'unified' ? UnifiedHunk : SplitHunk;
        const {
            headerGutterEvents,
            headerContentEvents,
            otherEvents
        } = this.selectEvents(customEvents);
        const {
            hunkClassName,
            headerClassName,
            headerGutterClassName,
            headerContentClassName,
            otherClassNames
        } = this.selectClassNames(customClassNames);

        return (
            <RenderingHunk
                {...props}
                headerGutterEvents={headerGutterEvents}
                headerContentEvents={headerContentEvents}
                className={hunkClassName}
                headerClassName={headerClassName}
                headerGutterClassName={headerGutterClassName}
                headerContentClassName={headerContentClassName}
                customEvents={otherEvents}
                customClassNames={otherClassNames}
            />
        );
    }
}
