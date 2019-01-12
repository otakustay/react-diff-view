import {Component} from 'react';
import {wrapDisplayName} from 'recompose';
import {getChangeKey} from '../utils';

export default ({multiple = false} = {}) => ComponentIn => class ComponentOut extends Component {

    static displayName = wrapDisplayName(ComponentIn, 'withChangeSelect');

    state = {
        selection: [],
        prevProps: {},
    };

    static getDerivedStateFromProps(nextProps, {prevProps}) {
        if (nextProps.hunks === prevProps.hunks) {
            return null;
        }

        return {
            selection: [],
            prevProps: {
                hunks: nextProps.hunks,
            },
        };
    }

    toggleSelection = ({change}) => {
        const key = getChangeKey(change);

        if (!multiple) {
            this.setState({selection: [key]});
            return;
        }

        const toggle = selection => (
            selection.includes(key)
                ? selection.filter(value => value !== key)
                : selection.concat(key)
        );

        this.setState(state => ({selection: toggle(state.selection)}));
    };

    render() {
        const {selection} = this.state;

        return (
            <ComponentIn
                {...this.props}
                selectedChanges={selection}
                onToggleChangeSelection={this.toggleSelection}
            />
        );
    }
};
