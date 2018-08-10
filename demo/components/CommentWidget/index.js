import Markdown from 'react-markdown';
import TimeAgo from 'react-timeago';
import CommentInput from './CommentInput';
import CommentIcon from './CommentIcon.svg';
import './index.css';

const Comment = ({content, postTime}) => (
    <div className="comment-content">
        <header>
            <CommentIcon className="comment-icon" />
            <TimeAgo date={postTime} minPeriod={60} />
        </header>
        <Markdown source={content} />
    </div>
);

/* eslint-disable react/no-array-index-key */
const CommentWidget = ({comments, writing, onSave}) => (
    <div className="comment-widget">
        {comments.map((comment, i) => <Comment key={i} {...comment} />)}
        {writing && <CommentInput onSave={onSave} />}
    </div>
);
/* eslint-enable react/no-array-index-key */

export default CommentWidget;
