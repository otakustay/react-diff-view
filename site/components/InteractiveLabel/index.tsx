import {HTMLAttributes} from 'react';
import styled from '@emotion/styled';
import {css} from '@emotion/react';

export const resetAsSpan = css`
    appearance: none;
    border: initial;
    background-color: initial;
    padding: initial;
`;

type StateType = 'hover' | 'active' | 'normal';

const colorForState = (state: StateType, disabled: boolean | undefined) => {
    const colorVarName = `--link-text${state === 'normal' ? '' : '-' + state}-color`;

    return disabled ? 'var(--disabled-text-color)' : `var(${colorVarName})`;
};

interface InteractiveProps {
    disabled?: boolean;
}

const interactiveAsLink = ({disabled}: InteractiveProps) => css`
    color: ${colorForState('normal', disabled)};
    cursor: ${disabled ? 'not-allowed' : 'pointer'};

    &:hover {
        color: ${colorForState('hover', disabled)};
    }

    &:focus,
    &:active {
        color: ${colorForState('active', disabled)};
    }
`;

interface Props extends HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
}

const InteractiveLabel = styled.button<Props>`
    ${resetAsSpan};
    ${interactiveAsLink};
    display: unset;
`;

export default InteractiveLabel;
