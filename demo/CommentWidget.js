import CommentInput from './CommentInput';
import './CommentWidget.css';

const CommentWidget = ({comments, writing, onSave}) => (
    <div className="comment-widget">
        {comments.map((content, i) => <pre key={i} className="comment">{content}</pre>)}
        {writing && <CommentInput onSave={onSave} />}
    </div>
);

export default CommentWidget;
