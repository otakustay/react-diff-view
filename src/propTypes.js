import PropTypes from 'prop-types';

export const viewTypePropType = PropTypes.oneOf(['unified', 'split']);

const change = {
    type: PropTypes.oneOf(['normal', 'add', 'del']).isRequired,
    content: PropTypes.string.isRequired,
    normal: PropTypes.bool,
    add: PropTypes.bool,
    del: PropTypes.bool,
    ln: PropTypes.number,
    ln1: PropTypes.number,
    ln2: PropTypes.number
};

export const changePropType = PropTypes.shape(change);

const chunk = {
    oldStart: PropTypes.number.isRequired,
    oldLines: PropTypes.number.isRequired,
    newStart: PropTypes.number.isRequired,
    newLines: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    changes: PropTypes.arrayOf(changePropType).isRequired
};

export const chunkPropType = PropTypes.shape(chunk);

const events = {
    gutterHeader: PropTypes.object,
    codeHeader: PropTypes.object,
    gutter: PropTypes.object,
    code: PropTypes.object
};

export const eventsPropType = PropTypes.shape(events);

const classNames = {
    gutterHeader: PropTypes.string,
    codeHeader: PropTypes.string,
    gutter: PropTypes.string,
    code: PropTypes.string
};

export const classNamesPropType = PropTypes.shape(classNames);

const widget = {
    change: changePropType.isRequired,
    element: PropTypes.element.isRequired
};

export const widgetPropType = PropTypes.shape(widget);
