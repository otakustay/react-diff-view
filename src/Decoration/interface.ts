import {ReactNode} from 'react';

export interface ActualDecorationProps {
    hideGutter: boolean;
    monotonous: boolean;
    className: string;
    gutterClassName: string;
    contentClassName: string;
    children: ReactNode | [ReactNode, ReactNode];
}
