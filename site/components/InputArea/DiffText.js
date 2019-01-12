import {PureComponent} from 'react';
import classNames from 'classnames';
import {bind} from 'lodash-decorators';
import {Icon} from 'antd';
import TextInput from './TextInput';
import SubmitButton from './SubmitButton';
import styles from './DiffText.css';

export default class DiffText extends PureComponent {

    state = {
        diff: '',
        source: '',
        isSourceVisible: false,
    };

    @bind()
    updateDiff(diff) {
        this.setState({diff});
    }

    @bind()
    updateSource(source) {
        this.setState({source});
    }

    @bind()
    toggleSourceInput() {
        this.setState(state => ({isSourceVisible: !state.isSourceVisible}));
    }

    @bind()
    submit() {
        const {onSubmit} = this.props;
        const {diff, source, isSourceVisible} = this.state;
        const data = {
            diff: diff,
            source: (isSourceVisible && source) ? source : null,
        };

        onSubmit(data);
    }

    render() {
        const {className, onSwitchInputType} = this.props;
        const {diff, source, isSourceVisible} = this.state;

        return (
            <div className={classNames(styles.root, className)}>
                <div className={styles.switch}>
                    <a onClick={onSwitchInputType}>I want to compare text</a>
                </div>
                <TextInput title="DIFF TEXT" value={diff} onChange={this.updateDiff} />
                <div className={styles.source}>
                    <a className={styles.toggle} onClick={this.toggleSourceInput}>
                        <Icon type={isSourceVisible ? 'up' : 'down'} />
                        {isSourceVisible ? 'Don\'t have any source code' : 'I have the old source code'}
                    </a>
                    <TextInput
                        className={isSourceVisible ? null : styles.hidden}
                        title="ORIGINAL SOURCE CODE"
                        value={source}
                        onChange={this.updateSource}
                    />
                </div>
                <SubmitButton onClick={this.submit} />
            </div>
        );
    }
}
