import {PureComponent, Fragment} from 'react';
import {bind} from 'lodash-decorators';
import sha from 'sha1';
import {Whether} from 'react-whether';
import {establishConfiguration} from '../../regions';
import {DiffView, Configuration} from '../../containers';
import InputArea from '../InputArea';
import styles from './index.css';

class App extends PureComponent {

    state = {
        diff: null,
        source: null
    };

    @bind()
    receiveInput(data) {
        this.setState(data);
    }

    render() {
        const {diff, source} = this.state;

        return (
            <div className={styles.root}>
                <InputArea onSubmit={this.receiveInput} />
                <Whether matches={!!diff}>
                    {
                        () => (
                            <Fragment>
                                <Configuration />
                                <DiffView key={sha(diff) + (source ? sha(source) : '')} diff={diff} source={source} />
                            </Fragment>
                        )
                    }
                </Whether>
            </div>
        );
    }
}

export default establishConfiguration('Configuration')(App);
