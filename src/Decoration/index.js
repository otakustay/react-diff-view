import {Children} from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';
import {Consumer} from '../context';
import SplitDecoration from './SplitDecoration';
import UnifiedDecoration from './UnifiedDecoration';
import './index.css';

const Decoration = props => {
    const childrenCount = Children.count(props.children);

    warning(
        childrenCount <= 2,
        'Decoration only accepts a maxium of 2 children'
    );

    warning(
        childrenCount < 2 || !props.hideGutter,
        'Gutter element in decoration will not be rendered since hideGutter prop is set to true'
    );


    return (
        <Consumer>
            {
                ({viewType, gutterType, monotonous}) => {
                    const RenderingDecoration = viewType === 'split' ? SplitDecoration : UnifiedDecoration;

                    return (
                        <RenderingDecoration
                            hideGutter={gutterType === 'none'}
                            monotonous={monotonous}
                            {...props}
                        />
                    );
                }
            }
        </Consumer>
    );
};

Decoration.propTypes = {
    className: PropTypes.string,
    gutterClassName: PropTypes.string,
    contentClassName: PropTypes.string,
    children: PropTypes.node.isRequired,
};

Decoration.defaultProps = {
    className: '',
    gutterClassName: '',
    contentClassName: '',
};

export default Decoration;
