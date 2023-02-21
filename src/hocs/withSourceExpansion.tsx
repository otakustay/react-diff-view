import {ComponentType} from 'react';
import {useSourceExpansion} from '../hooks';
import {HunkData, Source} from '../utils';
import {wrapDisplayName} from './wrapDisplayName';

export default function withSourceExpansion() {
    return function wrap<P extends {hunks: HunkData[], oldSource: Source}>(ComponentIn: ComponentType<P>) {
        function ComponentOut(props: P & {onExpandRange: (start: number, end: number) => void}) {
            const [renderingHunks, expandRange] = useSourceExpansion(props.hunks, props.oldSource);

            return (
                <ComponentIn
                    {...props}
                    hunks={renderingHunks}
                    onExpandRange={expandRange}
                />
            );
        }

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withSourceExpansion');

        return ComponentOut;
    };
}
