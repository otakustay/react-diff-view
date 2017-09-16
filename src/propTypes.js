import PropTypes from 'prop-types';

export const viewTypePropType = PropTypes.oneOf(['unified', 'split']);

const change = {
    type: PropTypes.oneOf(['delete', 'insert', 'normal']).isRequired,
    content: PropTypes.string.isRequired,
    isNormal: PropTypes.bool,
    isInsert: PropTypes.bool,
    isDelete: PropTypes.bool,
    lineNumber: PropTypes.number,
    oldLineNumber: PropTypes.number,
    newLineNumber: PropTypes.number
};

export const changePropType = PropTypes.shape(change);

const hunk = {
    oldStart: PropTypes.number.isRequired,
    oldLines: PropTypes.number.isRequired,
    newStart: PropTypes.number.isRequired,
    newLines: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    changes: PropTypes.arrayOf(changePropType).isRequired
};

export const hunkPropType = PropTypes.shape(hunk);

const events = {
    gutterHeader: PropTypes.object,
    codeHeader: PropTypes.object,
    gutter: PropTypes.object,
    code: PropTypes.object
};

export const eventsPropType = PropTypes.shape(events);

const classNames = {
    hunk: PropTypes.string,
    hunkHeader: PropTypes.string,
    gutterHeader: PropTypes.string,
    codeHeader: PropTypes.string,
    line: PropTypes.string,
    gutter: PropTypes.string,
    code: PropTypes.string
};

export const classNamesPropType = PropTypes.shape(classNames);
