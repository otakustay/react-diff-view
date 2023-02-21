import {ReactElement} from 'react';
import {ChangeData, HunkData} from '../utils';
import {EventMap, HunkTokens, RenderGutter, RenderToken} from '../context';

export interface SharedProps {
    hideGutter: boolean;
    gutterAnchor: boolean;
    monotonous: boolean;
    generateAnchorID: (change: ChangeData) => string | undefined;
    renderToken?: RenderToken;
    renderGutter: RenderGutter;
}

export interface ChangeSharedProps extends SharedProps {
    gutterClassName: string;
    codeClassName: string;
    gutterEvents: EventMap;
    codeEvents: EventMap;
}

export interface ActualHunkProps extends ChangeSharedProps {
    className: string;
    lineClassName: string;
    hunk: HunkData;
    widgets: Record<string, ReactElement>;
    hideGutter: boolean;
    selectedChanges: string[];
    tokens?: HunkTokens;
}
