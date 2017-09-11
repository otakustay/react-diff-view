import './LargeDiff.css';

const styles = [
    {display: 'block', height: 20, marginBottom: '1em', width: '40%', backgroundColor: '#eeffef'},
    {display: 'block', height: 20, marginBottom: '1em', width: '70%', backgroundColor: '#eeffef'},
    {display: 'block', height: 20, marginBottom: '1em', width: '50%', backgroundColor: '#fbf0f0'},
    {display: 'block', height: 20, marginBottom: '1em', width: '60%', backgroundColor: '#eeffef'}
];

const LargeDiff = ({onClick}) => (
    <div className="large-diff">
        {styles.map((style, i) => <span key={i} style={style} />)}
        <a className="force-render" onClick={onClick}>
            Large diffs are hidden by default, click to load
        </a>
    </div>
);

export default LargeDiff;
