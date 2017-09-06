import {createSelector} from 'reselect';
import {map, property} from 'lodash/fp';
import {languages} from 'lang-map';
import parsePath from 'path-parse';
import {addStubChunk} from '../src';

export const createFilenameSelector = () => createSelector(
    property('from'), property('to'),
    (from, to) => to === '/dev/null' ? from : to
);

export const createCanExpandSelector = computeFilename => createSelector(
    computeFilename,
    filename => filename === 'src/addons/link/ReactLink.js'
);

export const createCustomClassNamesSelector = computeFilename => createSelector(
    computeFilename,
    filename => {
        const {ext = ''} = parsePath(filename);
        const [language] = languages(ext);
        return {
            code: `language-${language || 'unknown'}`
        };
    }
);

export const createCustomEventsSelector = computeExpandable => createSelector(
    computeExpandable, property('addComment'), property('selectChange'), property('loadCollapsedBefore'),
    (canExpand, addComment, selectChange, loadCollapsedBefore) => {
        const baseEvents = {
            code: {
                onDoubleClick: addComment
            },
            gutter: {
                onClick: selectChange
            }
        };

        return canExpand
            ? {
                ...baseEvents,
                gutterHeader: {
                    onClick: loadCollapsedBefore
                }
            }
            : baseEvents;
    }
);

export const createRenderingChunksSelector = computeExpandable => createSelector(
    computeExpandable, property('chunks'),
    (canExpand, chunks) => (canExpand ? addStubChunk(chunks) : chunks)
);

const pluckChange = map('change');

export const createWidgetsSelector = createWidget => createSelector(
    property('comments'), property('writingChanges'),
    (comments, writingChanges) => {
        const changesWithWidgets = [...pluckChange(comments), ...writingChanges];
        return changesWithWidgets.reduce(
            (widgets, change) => {
                const lineComments = comments.filter(comment => comment.change === change);
                const writing = writingChanges.includes(change);
                return [
                    ...widgets,
                    {
                        change: change,
                        element: createWidget(change, lineComments, writing)
                    }
                ];
            },
            []
        );
    }
);
