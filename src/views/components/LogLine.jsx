const PropTypes = require('prop-types');
const React = require('react');

const LogLine = ({ type, message}) => {
    return (
        <div>
            <span className="icon" />
            <h4>{type}</h4>
            <span className="message">{message}</span>
        </div>
    );
};

module.exports = LogLine;
