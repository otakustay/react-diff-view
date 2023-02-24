import {useCallback} from 'react';
import styled from '@emotion/styled';
import InteractiveLabel from '../../InteractiveLabel';

const Text = styled.div`
    white-space: pre;
    word-break: break-all;
`;

const Footer = styled.footer`
    display: flex;
    align-items: center;
    justify-content: flex-end;;
    gap: 8px;
    margin-top: 12px;
`;

interface Props {
    commentId: string;
    content: string;
    time: Date;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function CommentDisplay({commentId, content, time, onEdit, onDelete}: Props) {
    const edit = useCallback(
        () => onEdit(commentId),
        [commentId, onEdit]
    );
    const remove = useCallback(
        () => onDelete(commentId),
        [commentId, onDelete]
    );

    return (
        <>
            <Text>
                {content}
            </Text>
            <Footer>
                <time>{time.toLocaleDateString()} {time.toLocaleTimeString()}</time>
                <InteractiveLabel onClick={edit}>edit</InteractiveLabel>
                <InteractiveLabel onClick={remove}>delete</InteractiveLabel>
            </Footer>
        </>
    );
}
