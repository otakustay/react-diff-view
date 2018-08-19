import {PureComponent} from 'react';
import classNames from 'classnames';
import {bind} from 'lodash-decorators';
import {withTransientRegion} from 'react-kiss';
import {formatLines, diffLines} from 'unidiff';
import TextInput from './TextInput';
import SubmitButton from './SubmitButton';
import styles from './DiffSource.css';

class DiffSource extends PureComponent {

    @bind()
    submit() {
        const {oldSource, newSource, onSubmit} = this.props;

        if (!oldSource || !newSource) {
            return;
        }

        const diffText = formatLines(diffLines(oldSource, newSource), {context: 3});
        const data = {
            diff: diffText,
            source: oldSource
        };

        onSubmit(data);
    }

    render() {
        const {className, oldSource, newSource, onOldSourceChange, onNewSourceChange, onSwitchInputType} = this.props;

        return (
            <div className={classNames(styles.root, className)}>
                <div className={styles.switch}>
                    <a onClick={onSwitchInputType}>I want to beautify a diff</a>
                </div>
                <div className={styles.input}>
                    <TextInput
                        className={styles.inputText}
                        title="ORIGINAL TEXT"
                        value={oldSource}
                        onChange={onOldSourceChange}
                    />
                    <TextInput
                        className={styles.inputText}
                        title="CHANGED TEXT"
                        value={newSource}
                        onChange={onNewSourceChange}
                    />
                </div>
                <SubmitButton onClick={this.submit} />
            </div>
        );
    }
}

const initialState = {
    oldSource: '',
    newSource: ''
};

const workflows = {
    onOldSourceChange(oldSource) {
        return {oldSource};
    },
    onNewSourceChange(newSource) {
        return {newSource};
    }
};

export default withTransientRegion(initialState, workflows)(DiffSource);
