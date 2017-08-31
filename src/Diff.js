import SplitChunk from './SplitChunk';
import UnifiedChunk from './UnifiedChunk';
import './Diff.css';

const Diff = ({chunks, viewType, ...props}) => {
    const cols = viewType === 'unified'
        ? (
            <colgroup>
                <col className="gutter-prev-col" />
                <col className="gutter-next-col" />
                <col />
            </colgroup>
        )
        : (
            <colgroup>
                <col className="gutter-prev-col" />
                <col />
                <col className="gutter-next-col" />
                <col />
            </colgroup>
        );
    const Chunk = viewType === 'unified' ? UnifiedChunk : SplitChunk;

    return (
        <table className="diff">
            {cols}
            {chunks.map((chunk, i) => <Chunk key={i} {...chunk} {...props} />)}
        </table>
    );
};

export default Diff;
