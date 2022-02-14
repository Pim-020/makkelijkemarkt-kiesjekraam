import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Modal } from 'antd'

import { MarketContext } from './MarketDataWrapper'
import { initialMarktConfiguratie } from '../services/mmApi'
import { IMarketContext } from '../models'
import { useSaveMarktConfig } from '../hooks'

const CreateMarketConfig = () => {
  const marketContext = useContext(MarketContext) as IMarketContext
  const [isModalVisible, setIsModalVisible] = React.useState(true)
  const { mutate } = useSaveMarktConfig(marketContext.marktId)
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

  const title = `${marketContext.markt?.naam}`

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

export default CreateMarketConfig
