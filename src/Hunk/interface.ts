import {DOMAttributes, ReactElement} from 'react';
import {ChangeData, HunkData} from '../utils';
import {HunkTokens, RenderGutter, RenderToken} from '../context';

type IsEvent<T> = T extends `on${string}` ? T : never;

export type EventKeys = IsEvent<keyof DOMAttributes<HTMLElement>>;

export type NativeEventMap = Partial<{[K in EventKeys]: DOMAttributes<HTMLElement>[K]}>;

type ExtractEventHandler<E extends EventKeys> = Exclude<NativeEventMap[E], undefined>;

type ExtractEventType<E extends EventKeys> = Parameters<ExtractEventHandler<E>>[0];

export interface ChangeEventArgs {
    // TODO: use union type on next major version
    side?: 'old' | 'new';
    change: ChangeData | null;
}

type BindEvent<E extends EventKeys> = (args: ChangeEventArgs, event: ExtractEventType<E>) => void;

export type EventMap = Partial<{[K in EventKeys]: BindEvent<K>}>;

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
