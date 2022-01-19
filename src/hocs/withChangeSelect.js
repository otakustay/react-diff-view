import {wrapDisplayName} from './wrapDisplayName';
import {useChangeSelect} from '../hooks';

export default options => ComponentIn => {
    const ComponentOut = props => {
        const [selectedChanges, toggleChangeSelection] = useChangeSelect(props.hunks, options);

        return (
            <ComponentIn
                {...props}
                selectedChanges={selectedChanges}
                onToggleChangeSelection={toggleChangeSelection}
            />
        );
    };

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withChangeSelect');

    return ComponentOut;
};
