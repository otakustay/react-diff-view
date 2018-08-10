import {PureComponent} from 'react';
import {bind} from 'lodash-decorators';
import './index.css';

export default class ManualInput extends PureComponent {

    state = {
        oldText: '',
        newText: ''
    };

    @bind()
    updateOldText(e) {
        this.setState({oldText: e.target.value});
    }

    @bind()
    updateNewText(e) {
        this.setState({newText: e.target.value});
    }

    @bind()
    submit() {
        const {onSubmit} = this.props;
        const {oldText, newText} = this.state;

        onSubmit(oldText, newText);
    }

    render() {
        const {oldText, newText} = this.state;

        return (
            <div>
                <div className="manual-input-area">
                    <div>
                        <h3>ORIGINAL TEXT</h3>
                        <textarea onChange={this.updateOldText} value={oldText} />
                    </div>
                    <div>
                        <h3>CHANGED TEXT</h3>
                        <textarea onChange={this.updateNewText} value={newText} />
                    </div>
                </div>
                <button className="manual-input-submit" onClick={this.submit}>Start Diff</button>
            </div>
        );
    }
}
