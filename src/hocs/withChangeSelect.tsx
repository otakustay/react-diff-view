import {ComponentType} from 'react';
import {useChangeSelect, UseChangeSelectOptions} from '../hooks';
import {ChangeEventArgs} from '../context';
import {HunkData} from '../utils';
import {wrapDisplayName} from './wrapDisplayName';

export default function withChangeSelect(options: UseChangeSelectOptions) {
    return function wrap<P extends {hunks: HunkData[]}>(ComponentIn: ComponentType<P>) {
        function ComponentOut(props: P & {onToggleChangeSelection: (args: ChangeEventArgs) => void}) {
            const [selectedChanges, toggleChangeSelection] = useChangeSelect(props.hunks, options);
            return (
                <ComponentIn
                    {...props}
                    selectedChanges={selectedChanges}
                    onToggleChangeSelection={toggleChangeSelection}
                />
            );
        }

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withChangeSelect');

        return ComponentOut;
    };
}
