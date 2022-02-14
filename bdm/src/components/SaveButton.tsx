import React from 'react'
import { Button } from 'antd';
import { SaveFilled } from '@ant-design/icons';

interface Props {
    clickHandler(): void
    saveInProgress: boolean
}

const SaveButton: React.FC<Props> = ({clickHandler, children, saveInProgress }) => {
return (
    <Button type="primary" shape="round" icon={<SaveFilled />} size="large" onClick={clickHandler} loading={saveInProgress}>
        {children}
    </Button>
    )
}

export default SaveButton
