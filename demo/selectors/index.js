import {createSelector} from 'reselect';
import {property, union} from 'lodash/fp';
import {expandFromRawCode, expandCollapsedBlockBy} from 'react-diff-view';
import rawCode from '../assets/CSSPropertyOperations.raw';

export const createFilenameSelector = () => createSelector(
    property('type'), property('oldPath'), property('newPath'),
    (type, oldPath, newPath) => (type === 'delete' ? oldPath : newPath)
);

export const createCanExpandSelector = computeFilename => createSelector(
    computeFilename,
    filename => filename === 'src/renderers/dom/shared/CSSPropertyOperations.js'
);

export const createRenderingHunksSelector = computeExpandable => createSelector(
    computeExpandable, property('hunks'),
    (canExpand, hunks) => {
        if (canExpand) {
            // Expand a normal section to demostrate util function
            return expandCollapsedBlockBy(
                expandFromRawCode(hunks, rawCode, 18, 22),
                rawCode,
                lines => lines <= 10
            );
        }

        return hunks;
    }
);

export const createWidgetsSelector = createWidget => createSelector(
    property('comments'), property('writingChanges'),
    (comments, writingChanges) => {
        const changeKeys = union(Object.keys(comments), writingChanges);

        return changeKeys.reduce(
            (widgets, key) => {
                const lineComments = comments[key] || [];
                const writing = writingChanges.includes(key);

                return {
                    ...widgets,
                    [key]: createWidget(key, lineComments, writing)
                };
            },
            {}
        );
    }
);
