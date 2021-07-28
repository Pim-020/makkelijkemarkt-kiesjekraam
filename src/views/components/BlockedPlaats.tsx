import * as React from 'react';

const BlockedPlaats = (p) => {

    return (
        <tr className="Plaats Plaats--first" >
            <td className="Plaats__prop"></td>
            <td className="Plaats__prop Plaats__prop-plaats-nr">{p.nr}</td>
            <td className="Plaats__prop">x</td>
            <td className="Plaats__prop">x</td>
            <td className="Plaats__prop">x</td>
            <td className="Plaats__prop">x</td>
            <td className="Plaats__prop">x</td>
            <td className="Plaats__prop">x</td>
        </tr>
    );
};

export default BlockedPlaats;
