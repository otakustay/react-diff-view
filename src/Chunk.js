import PropTypes from 'prop-types';
import UnifiedChunk from './UnifiedChunk';
import SplitChunk from './SplitChunk';
import {viewTypePropType, eventsPropType, chunkPropType, changePropType, widgetPropType} from './propTypes';
import './Chunk.css';

const Chunk = ({viewType, customEvents, customClassNames, ...props}) => {
    const RenderingChunk = viewType === 'unified' ? UnifiedChunk : SplitChunk;
    const {
        gutterHeader: headerGutterEvents,
        codeHeader: headerContentEvents,
        ...otherEvents
    } = customEvents;
    const {
        chunk: chunkClassName,
        chunkHeader: headerClassName,
        gutterHeader: headerGutterClassName,
        codeHeader: headerContentClassName,
        ...otherClassNames
    } = customClassNames;

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
};

Chunk.propTypes = {
    viewType: viewTypePropType,
    chunk: chunkPropType.isRequired,
    header: PropTypes.oneOfType([PropTypes.node, PropTypes.shape([PropTypes.node, PropTypes.node])]),
    widgets: PropTypes.arrayOf(widgetPropType),
    selectedChanges: PropTypes.arrayOf(changePropType),
    customEvents: eventsPropType,
};

Chunk.defaultProps = {
    viewType: 'split',
    widgets: [],
    selectedChanges: [],
    customEvents: {}
};

export default Chunk;
