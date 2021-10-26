import {wrapDisplayName} from 'recompose';
import {ComponentType} from 'react';
import {useMinCollapsedLines} from '../hooks';

const minCollapsedLines = (minLinesExclusive: number) => (ComponentIn: ComponentType<any>) => {
    function ComponentOut(props: any) {
        const renderingHunks = useMinCollapsedLines(minLinesExclusive, props.hunks, props.oldSource);
        return <ComponentIn {...props} hunks={renderingHunks} />;
    }

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'minCollapsedLines');

    return ComponentOut;
};

export default minCollapsedLines;
