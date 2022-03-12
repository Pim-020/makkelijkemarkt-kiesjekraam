import React from 'react'

type Props = {
  options: {name: string, destination: string}[],
  children: JSX.Element,
}

const PullDownMenu: (props: Props) => JSX.Element = (props) => {
  const options = props.options.map((option:any) => <a href={option.destination}>{option.name}</a>)
  return (
    <div className="dropdown" >
    <button className="dropbtn">
      <span>
        {props.children}
      </span>
      </button>
    <div className="dropdown-content">
      {options}
    </div>
  </div>
  )
}

export default PullDownMenu
