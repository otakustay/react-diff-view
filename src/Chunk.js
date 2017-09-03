import UnifiedChunk from './UnifiedChunk';
import SplitChunk from './SplitChunk';
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

export default Chunk;
