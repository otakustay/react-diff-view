import {defineRegion} from 'react-kiss';

const initialState = {
    viewType: 'split',
    editsType: 'block',
    showGutter: true,
    language: 'text'
};

const workflows = {
    update(configuration) {
        return configuration;
    }
};

export default defineRegion(initialState, workflows);
