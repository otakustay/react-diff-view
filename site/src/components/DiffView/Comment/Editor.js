import {useCallback, useState} from 'react';
import styled from 'styled-components';
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

export default function CommentEditor({commentId, type, defaultContent, onSave, onCancel, onDelete}) {
    const [value, setValue] = useState(defaultContent);
    const updateValue = useCallback(
        e => setValue(e.target.value),
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
