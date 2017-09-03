import CommentInput from './CommentInput';
import CommentIcon from './CommentIcon.svg';
import './CommentWidget.css';

const Comment = ({content}) => (
    <div className="comment">
        <CommentIcon className="comment-icon" />
        <div className="comment-content">{content}</div>
    </div>
);

const CommentWidget = ({comments, writing, onSave}) => (
    <div className="comment-widget">
        {comments.map((content, i) => <Comment key={i} content={content} />)}
        {writing && <CommentInput onSave={onSave} />}
    </div>
);

export default CommentWidget;
