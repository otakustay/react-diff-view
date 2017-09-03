import UnifiedChunk from './UnifiedChunk';
import SplitChunk from './SplitChunk';
import './Chunk.css';

const Chunk = ({viewType, ...props}) => {
    const RenderingChunk = viewType === 'unified' ? UnifiedChunk : SplitChunk;

    return <RenderingChunk {...props} />;
};

export default Chunk;
