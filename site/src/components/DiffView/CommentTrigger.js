import {useCallback} from 'react';
import styled from 'styled-components';
import {getChangeKey} from 'react-diff-view';

const Trigger = styled.span`
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    z-index: 1;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    font-size: 16px;
    font-weight: bold;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(27, 31, 35, .15);
    color: #999;

    :hover {
        transition: all .2s linear;
        background-color: #fafafa;
        color: #333;
    }
`;

export default function CommentTrigger({change, onClick}) {
    const click = useCallback(
        () => onClick(getChangeKey(change)),
        [change, onClick]
    );

    return (
        <Trigger onClick={click}>
            +
        </Trigger>
    );
}
