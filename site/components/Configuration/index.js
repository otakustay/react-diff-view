import {PureComponent} from 'react';
import {pick} from 'lodash';
import {Select, Icon} from 'antd';
import {withTransientRegion} from 'react-kiss';
import OptionsModal from './OptionsModal';
import styles from './index.less';

const {Option} = Select;

class Configuration extends PureComponent {

    constructor(props) {
        super(props);

        this.switchViewType = this.overrideConfiguration.bind(this, 'viewType');
        this.changeLanguage = this.overrideConfiguration.bind(this, 'language');
        this.switchEditsType = this.overrideConfiguration.bind(this, 'editsType');
        this.switchGutterVisibility = this.overrideConfiguration.bind(this, 'showGutter');
    }

    overrideConfiguration(name, value) {
        const current = pick(this.props, 'viewType', 'markEdits', 'language');
        const newConfiguration = {
            ...current,
            [name]: value,
        };
        this.props.onChange(newConfiguration);
    }

    render() {
        const {language, isModalVisible, onOpenModal, onCloseModal, ...configuration} = this.props;

        return (
            <div className={styles.root}>
                <Icon className={styles.setting} type="setting" onClick={onOpenModal} />
                <Select className={styles.language} value={language} onChange={this.changeLanguage}>
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
                    onClose={onCloseModal}
                    onSwitchViewType={this.switchViewType}
                    onSwitchEditsType={this.switchEditsType}
                    onSwitchGutterVisibility={this.switchGutterVisibility}
                    {...configuration}
                />
            </div>
        );
    }
}

const initialState = {
    isModalVisible: false,
};

const workflows = {
    onOpenModal() {
        return {isModalVisible: true};
    },

    onCloseModal() {
        return {isModalVisible: false};
    },
};

export default withTransientRegion(initialState, workflows)(Configuration);
