import {Children} from 'react';
import {useDiffSettings} from '../context';
import {DecorationProps} from '../interface';
import SplitDecoration from './SplitDecoration';
import UnifiedDecoration from './UnifiedDecoration';

const warning = (condition: boolean, format: string) => {
    if (!condition) {
        console.error(format);
    }
};

function Decoration(props: DecorationProps) {
    const childrenCount = Children.count(props.children);

    warning(
        childrenCount <= 2,
        'Decoration only accepts a maxium of 2 children'
    );

    warning(
        childrenCount < 2 || !props.hideGutter,
        'Gutter element in decoration will not be rendered since hideGutter prop is set to true'
    );

    const {viewType, gutterType, monotonous} = useDiffSettings();
    const RenderingDecoration = viewType === 'split' ? SplitDecoration : UnifiedDecoration;

    return (
        <RenderingDecoration
            hideGutter={gutterType === 'none'}
            monotonous={monotonous}
            {...props}
        />
    );
}

export default Decoration;
