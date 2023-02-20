import {DOMAttributes, ReactElement, ReactNode} from 'react';
import {ChangeData, HunkData} from '../utils';
import {TokenNode} from '../tokenize';

export type DefaultRenderToken = (token: TokenNode, index: number) => ReactNode;

export type RenderToken = (token: TokenNode, renderDefault: DefaultRenderToken, index: number) => ReactNode;

type IsEvent<T> = T extends `on${string}` ? T : never;

export type EventKeys = IsEvent<keyof DOMAttributes<HTMLElement>>;

export type NativeEventMap = {[K in EventKeys]: DOMAttributes<HTMLElement>[K]};

type ExtractEventHandler<E extends EventKeys> = Exclude<NativeEventMap[E], undefined>;

type ExtractEventType<E extends EventKeys> = Parameters<ExtractEventHandler<E>>[0];

export interface ChangeEventArgs {
    // TODO: use union type on next major version
    side?: 'old' | 'new';
    change: ChangeData | null;
}

type BindEvent<E extends EventKeys> = (args: ChangeEventArgs, event: ExtractEventType<E>) => void;

export type EventMap = {[K in EventKeys]: BindEvent<K>};

export interface GutterOptions {
    change: ChangeData;
    side: 'old' | 'new';
    inHoverState: boolean;
    renderDefault: DefaultRenderToken;
    wrapInAnchor: (element: ReactElement) => ReactElement;
}

export type RenderGutter = (options: GutterOptions) => ReactElement;

export interface ChangeSharedProps {
    gutterClassName: string;
    codeClassName: string;
    gutterEvents: EventMap;
    codeEvents: EventMap;
    hideGutter: boolean;
    gutterAnchor: boolean;
    monotonous: boolean;
    generateAnchorID: (change: ChangeData) => string;
    renderToken: RenderToken;
    renderGutter: RenderGutter;
}

export interface HunkTokens {
    old: TokenNode[][];
    new: TokenNode[][];
}

export interface HunkProps extends ChangeSharedProps {
    className: string;
    lineClassName: string;
    hunk: HunkData;
    widgets: Record<string, ReactElement>;
    hideGutter: boolean;
    selectedChanges: string[];
    tokens?: HunkTokens;
}
