import {Decoration} from 'react-diff-view';

const HunkInfo = ({hunk, ...props}) => (
    <Decoration {...props}>
        {null}
        {hunk.content}
    </Decoration>
);

export default HunkInfo;
