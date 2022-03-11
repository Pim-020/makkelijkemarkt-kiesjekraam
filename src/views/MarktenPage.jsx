const React = require('react');
const Page = require('./components/Page.jsx');
const PropTypes = require('prop-types');
const Header = require('./components/Header');
const Content = require('./components/Content');
const MarktList = require('./components/MarktList');
import PullDownMenu from './components/PullDownMenu'

class MarktenPage extends React.Component {
    propTypes = {
        markten: PropTypes.array,
        user: PropTypes.object,
        role: PropTypes.string,
    };

    render() {
        const breadcrumbs = [];
        const { role, user, markten } = this.props;
        return (
            <Page>
                <Header
                    role={role}
                    user={user}
                    breadcrumbs={breadcrumbs}
                >
                    <PullDownMenu />
                </Header>
                <Content>
                    {/* <h1 className="Heading Heading--intro">Acties</h1>
                    <a href="/upload-markten" className="Link">Upload markten</a> */}

                    <h1 className="Heading Heading--intro">Markten</h1>
                    <MarktList markten={markten} />
                </Content>
            </Page>
        );
    }
}

module.exports = MarktenPage;
