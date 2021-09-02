import styled from 'styled-components';
import Editor from './Editor';
import Display from './Display';

const Layout = styled.div`
    padding: 12px 8px;
    background-color: var(--antd-background-color-light);
`;

export default function Comment({id, content, state, time, onSave, onEdit, onCancel, onDelete}) {
    return (
        <Layout>
            {
                state === 'display'
                    ? <Display commentId={id} content={content} time={time} onEdit={onEdit} onDelete={onDelete} />
                    : (
                        <Editor
                            commentId={id}
                            type={state}
                            defaultContent={content}
                            onSave={onSave}
                            onCancel={onCancel}
                            onDelete={onDelete}
                        />
                    )
            }
        </Layout>
    );
}
