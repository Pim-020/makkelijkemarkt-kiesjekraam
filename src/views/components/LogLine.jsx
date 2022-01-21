const PropTypes = require('prop-types');
const React = require('react');

const LogLine = ({ type, message}) => {
    return (
        <pre>
            {type} : {message}
        </pre>
    );
};

module.exports = LogLine;
