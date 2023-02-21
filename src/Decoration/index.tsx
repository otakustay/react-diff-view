import {Children, ReactNode} from 'react';
import warning from 'warning';
import {useDiffSettings} from '../context';
import SplitDecoration from './SplitDecoration';
import UnifiedDecoration from './UnifiedDecoration';

export interface DecorationProps {
    className?: string;
    gutterClassName?: string;
    contentClassName?: string;
    children: ReactNode | [ReactNode, ReactNode];
}

export default function Decoration(props: DecorationProps) {
    const {
        className = '',
        gutterClassName = '',
        contentClassName = '',
        children,
    } = props;
    const {viewType, gutterType, monotonous} = useDiffSettings();
    const RenderingDecoration = viewType === 'split' ? SplitDecoration : UnifiedDecoration;
    const childrenCount = Children.count(children);
    const hideGutter = gutterType === 'none';

    warning(
        childrenCount <= 2,
        'Decoration only accepts a maxium of 2 children'
    );

    warning(
        childrenCount < 2 || !hideGutter,
        'Gutter element in decoration will not be rendered since hideGutter prop is set to true'
    );


    // TODO: maybe we should use union type to pass children
    return (
        <RenderingDecoration
            hideGutter={hideGutter}
            monotonous={monotonous}
            className={className}
            gutterClassName={gutterClassName}
            contentClassName={contentClassName}
        >
            {children}
        </RenderingDecoration>
    );
}
