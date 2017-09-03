import PropTypes from 'prop-types';
import UnifiedChunk from './UnifiedChunk';
import SplitChunk from './SplitChunk';
import {viewTypePropType, eventsPropType, chunkPropType, changePropType, widgetPropType} from './propTypes';
import './Chunk.css';

const Chunk = ({viewType, customEvents, ...props}) => {
    const RenderingChunk = viewType === 'unified' ? UnifiedChunk : SplitChunk;
    const {gutterHeader: headerGutterEvents, codeHeader: headerContentEvents, ...otherEvents} = customEvents;

    return (
        <RenderingChunk
            {...props}
            headerGutterEvents={headerGutterEvents}
            headerContentEvents={headerContentEvents}
            customEvents={otherEvents}
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
