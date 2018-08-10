import {PureComponent} from 'react';
import {bind} from 'lodash-decorators';
import './CommentInput.css';

export default class CommentInput extends PureComponent {

    state = {
        content: ''
    };

    @bind()
    syncContent(e) {
        this.setState({content: e.target.value});
    }

    @bind()
    save() {
        const {onSave} = this.props;
        const {content} = this.state;

        onSave(content);
    }

    render() {
        return (
            <div className="comment-input">
                <textarea autoFocus onChange={this.syncContent} />
                <footer>
                    <span className="comment-input-hint">Markdown enabled</span>
                    <button type="button" onClick={this.save}>Save</button>
                </footer>
            </div>
        );
    }
}
