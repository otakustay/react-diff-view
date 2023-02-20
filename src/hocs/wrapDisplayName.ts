import {ComponentType} from 'react';

// Based on https://github.com/acdlite/recompose/blob/a255b23/src/packages/recompose/getDisplayName.js
function getDisplayName(Component: ComponentType<any>) {
    return (typeof Component === 'string' || Component == null)
        ? Component
        : Component.displayName || Component.name || 'Component';
}

// based on https://github.com/acdlite/recompose/blob/d55575f/src/packages/recompose/wrapDisplayName.js
export function wrapDisplayName(BaseComponent: ComponentType<any>, hocName: string) {
    return `${hocName}(${getDisplayName(BaseComponent)})`;
}
