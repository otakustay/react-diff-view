import {ReactNode} from 'react';
import {ChangeData, HunkData} from '../utils';
import {EventMap, RenderGutter, RenderToken} from '../context';
import {HunkTokens} from '../tokenize';

export interface SharedProps {
    hideGutter: boolean;
    gutterAnchor: boolean;
    monotonous: boolean;
    generateAnchorID: (change: ChangeData) => string | undefined;
    generateLineClassName: (params: {changes: ChangeData[], defaultGenerate: () => string}) => string | undefined;
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
    widgets: Record<string, ReactNode>;
    hideGutter: boolean;
    selectedChanges: string[];
    tokens?: HunkTokens | null;
}
