import {useCallback, useState} from 'react';
import {Select} from 'antd';
import {SettingOutlined} from '@ant-design/icons';
import {
    useConfiguration,
    useSwitchViewType,
    usechangeLanguage,
    useSwitchEditsType,
    useSwitchGutterVisibility,
} from '../../context/configuration';
import OptionsModal from './OptionsModal';
import styles from './index.less';

const {Option} = Select;

function useBoolean(initialValue: boolean) {
    const [value, setValue] = useState(initialValue);
    const on = useCallback(() => setValue(true), []);
    const off = useCallback(() => setValue(false), []);
    return [value, on, off] as const;
}

export default function Configuration() {
    const [isModalVisible, openModal, closeModal] = useBoolean(false);
    const configuration = useConfiguration();
    const switchViewType = useSwitchViewType();
    const changeLanguage = usechangeLanguage();
    const switchEditsType = useSwitchEditsType();
    const switchGutterVisibility = useSwitchGutterVisibility();

    return (
        <div className={styles.root}>
            <SettingOutlined className={styles.setting} onClick={openModal} />
            <Select className={styles.language} value={configuration.language} onChange={changeLanguage}>
                <Option value="text">Plain Text</Option>
                <Option value="jsx">JavaScript(JSX)</Option>
                <Option value="java">Java</Option>
                <Option value="php">PHP</Option>
                <Option value="python">Python</Option>
                <Option value="bash">Shell</Option>
                <Option value="cpp">C++</Option>
                <Option value="c">C</Option>
                <Option value="css">CSS</Option>
                <Option value="markup">HTML/XML</Option>
                <Option value="json">JSON</Option>
            </Select>
            <OptionsModal
                visible={isModalVisible}
                onClose={closeModal}
                onSwitchViewType={switchViewType}
                onSwitchEditsType={switchEditsType}
                onSwitchGutterVisibility={switchGutterVisibility}
                {...configuration}
            />
        </div>
    );
}
