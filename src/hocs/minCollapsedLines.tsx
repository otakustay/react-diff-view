import {ComponentType} from 'react';
import {useMinCollapsedLines} from '../hooks';
import {DiffProps} from '../Diff';
import {Source} from '../utils';
import {wrapDisplayName} from './wrapDisplayName';

export default function minCollapsedLines(minLinesExclusive: number) {
    return function wrap(ComponentIn: ComponentType<DiffProps>) {
        function ComponentOut(props: DiffProps & {oldSource: Source}) {
            const renderingHunks = useMinCollapsedLines(minLinesExclusive, props.hunks, props.oldSource);
            return <ComponentIn {...props} hunks={renderingHunks} />;
        }

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'minCollapsedLines');

        return ComponentOut;
    };
}
