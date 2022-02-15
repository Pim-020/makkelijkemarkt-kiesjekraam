import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Modal } from 'antd'

import { MarktContext } from './MarktDataWrapper'
import { initialMarktConfiguratie } from '../services/mmApi'
import { IMarktContext } from '../models'
import { useSaveMarktConfig } from '../hooks'

const CreateMarktConfig = () => {
  const marktContext = useContext(MarktContext) as IMarktContext
  const [isModalVisible, setIsModalVisible] = React.useState(true)
  const { mutate } = useSaveMarktConfig(marktContext.marktId)
  const history = useHistory()

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = () => {
    setIsModalVisible(false)
    mutate(initialMarktConfiguratie)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    history.goBack()
  }

  const title = `${marktContext.markt?.naam}`

  return (
    <Modal
      title={title}
      visible={isModalVisible}
      okText="marktconfiguratie aanmaken"
      onOk={handleOk}
      cancelText="terug"
      onCancel={handleCancel}
    >
      <p>Er bestaat nog geen marktconfiguratie voor deze markt</p>
    </Modal>
  )
}

export default CreateMarktConfig
