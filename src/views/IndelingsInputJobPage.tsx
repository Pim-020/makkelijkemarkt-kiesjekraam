import * as React from 'react';
import LogLine from './components/LogLine';

export default class IndelingsLogsPage extends React.Component {
    public render() {
        const props = this.props;
        var data = props["data"];
        return (<pre>{data}</pre>);
    }
}
