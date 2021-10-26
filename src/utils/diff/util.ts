export const first = <T>(array: T[]): T => array[0];

export const last = <T>(array: T[]): T => array[array.length - 1];

export const sideToProperty = (side: 'old'| 'new') => [side + 'Start', side + 'Lines'];
