const ReactDOMServer = require('react-dom/server');
const nodemailer = require('nodemailer');
const { requireEnv } = require('./util.ts');
const { URL } = require('url');

requireEnv('MAILER_URL');

const { username, password, hostname, port, searchParams } = new URL(process.env.MAILER_URL);

const transport = nodemailer.createTransport(
    {
        host: hostname,
        port,
        auth: {
            user: username || searchParams.get('username'),
            pass: password || searchParams.get('password'),
        },
    },
);

const mail = options => {
    if (options.react) {
        options = {
            ...options,
            html: ReactDOMServer.renderToStaticMarkup(options.react),
        };
    }
    return transport.sendMail(options);
};

module.exports = {
    mail,
};
