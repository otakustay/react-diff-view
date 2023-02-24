import styled from '@emotion/styled';
import Editor from './Editor';
import Display from './Display';

const Layout = styled.div`
    padding: 12px 8px;
    background-color: var(--background-color-secondary);
`;

interface Props {
    id: string;
    content: string;
    state: 'create' | 'edit' | 'display';
    time: Date;
    onSave: (id: string, content: string) => void;
    onEdit: (id: string) => void;
    onCancel: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function Comment({id, content, state, time, onSave, onEdit, onCancel, onDelete}: Props) {
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
