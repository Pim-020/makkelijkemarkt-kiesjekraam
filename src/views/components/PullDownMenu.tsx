import React from 'react'

const PullDownMenu = () => {
  return (
    <div className="dropdown" >
    <button className="dropbtn">Dropdown</button>
    <div className="dropdown-content">
      <a href="/bdm/branches">Branches instellen</a>
    </div>
  </div>
  )
}

export default PullDownMenu
