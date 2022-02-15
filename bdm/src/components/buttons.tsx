import React from 'react'
import { Button } from 'antd'
import { SaveFilled } from '@ant-design/icons'

interface BaseButtonProps {
  icon: JSX.Element
  clickHandler(): void
  inProgress?: boolean
}

interface Props extends Omit<BaseButtonProps, 'icon'> {}

const BaseButton: React.FC<BaseButtonProps> = ({ icon, clickHandler, children, inProgress = false }) => {
  return (
    <Button type="primary" shape="round" icon={icon} size="large" onClick={clickHandler} loading={inProgress}>
      {children}
    </Button>
  )
}

export const SaveButton: React.FC<Props> = (props) => BaseButton({ ...props, icon: <SaveFilled /> })
