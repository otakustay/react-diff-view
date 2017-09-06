import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import UnifiedChunk from './UnifiedChunk';
import SplitChunk from './SplitChunk';
import {createChunkEventsSelector, createChunkClassNamesSelector} from './selectors';
import {viewTypePropType, eventsPropType, chunkPropType, changePropType, widgetPropType} from './propTypes';
import './Chunk.css';

export default class Chunk extends PureComponent {

    static propTypes = {
        viewType: viewTypePropType,
        chunk: chunkPropType.isRequired,
        header: PropTypes.oneOfType([PropTypes.node, PropTypes.shape([PropTypes.node, PropTypes.node])]),
        widgets: PropTypes.arrayOf(widgetPropType),
        selectedChanges: PropTypes.arrayOf(changePropType),
        customEvents: eventsPropType,
    };

    static defaultProps = {
        viewType: 'split',
        widgets: [],
        selectedChanges: [],
        customEvents: {}
    };

    selectEvents = createChunkEventsSelector();

    selectClassNames = createChunkClassNamesSelector();

    render() {
        const {viewType, customEvents, customClassNames, ...props} = this.props;
        const RenderingChunk = viewType === 'unified' ? UnifiedChunk : SplitChunk;
        const {
            headerGutterEvents,
            headerContentEvents,
            otherEvents
        } = this.selectEvents(customEvents);
        const {
            chunkClassName,
            headerClassName,
            headerGutterClassName,
            headerContentClassName,
            otherClassNames
        } = this.selectClassNames(customClassNames);

        return (
            <RenderingChunk
                {...props}
                headerGutterEvents={headerGutterEvents}
                headerContentEvents={headerContentEvents}
                className={chunkClassName}
                headerClassName={headerClassName}
                headerGutterClassName={headerGutterClassName}
                headerContentClassName={headerContentClassName}
                customEvents={otherEvents}
                customClassNames={otherClassNames}
            />
        );
    }
}
