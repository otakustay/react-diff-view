export function first<T>(array: T[]) {
    return array[0];
}

export function last<T>(array: T[]) {
    return array[array.length - 1];
}

export function sideToProperty(side: 'old' | 'new') {
    return [`${side}Start`, `${side}Lines`] as const;
}
