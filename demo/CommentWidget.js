import Markdown from 'react-markdown';
import TimeAgo from 'react-timeago';
import CommentInput from './CommentInput';
import CommentIcon from './CommentIcon.svg';
import './CommentWidget.css';

const Comment = ({content, postTime}) => (
    <div className="comment">
        <header>
            <CommentIcon className="comment-icon" />
            <TimeAgo date={postTime} minPeriod={60} />
        </header>
        <Markdown source={content} />
    </div>
);

const CommentWidget = ({comments, writing, onSave}) => (
    <div className="comment-widget">
        {comments.map((comment, i) => <Comment key={i} {...comment} />)}
        {writing && <CommentInput onSave={onSave} />}
    </div>
);

export default CommentWidget;
