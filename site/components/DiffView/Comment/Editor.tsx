import {ChangeEvent, useCallback, useState} from 'react';
import styled from '@emotion/styled';
import {Button, Input} from 'antd';

const Layout = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Footer = styled.footer`
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
`;

interface Props {
    commentId: string;
    type: 'edit' | 'create';
    defaultContent: string;
    onSave: (id: string, value: string) => void;
    onCancel: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function CommentEditor({commentId, type, defaultContent, onSave, onCancel, onDelete}: Props) {
    const [value, setValue] = useState(defaultContent);
    const updateValue = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value),
        []
    );
    const save = useCallback(
        () => onSave(commentId, value),
        [commentId, value, onSave]
    );
    const cancel = useCallback(
        () => {
            if (type === 'edit') {
                onCancel(commentId);
            }
            else {
                onDelete(commentId);
            }
        },
        [commentId, type, onCancel, onDelete]
    );

    return (
        <Layout>
            <Input.TextArea rows={6} value={value} onChange={updateValue} />
            <Footer>
                <Button onClick={cancel}>Cancel</Button>
                <Button type="primary" onClick={save}>Save</Button>
            </Footer>
        </Layout>
    );
}
