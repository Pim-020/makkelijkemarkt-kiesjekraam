import React from 'react';

type Option = {
    name: string;
    destination: string;
};

type Props = {
    options: Option[];
    children: JSX.Element;
};

const PullDownMenu = (props: Props) => {
    const options = props.options.map((option: Option) => (
        <a className="pull-down-menu__option" href={option.destination}>
            {option.name}
        </a>
    ));
    return (
        <div className="pull-down-menu">
            <button className="pull-down-menu__header">
                <span>{props.children}</span>
            </button>
            <div className="pull-down-menu__content">{options}</div>
        </div>
    );
};

export default PullDownMenu;
