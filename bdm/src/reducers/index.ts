import { orderBy } from 'lodash'
import { Reducer } from 'react'

import { IItemReducerAction, IItemReducerItem } from '../models'

export const itemReducer: Reducer<IItemReducerItem[], IItemReducerAction> = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_ITEM_PROPERTY':
      return state.map((item) => {
        if (item.id === action.payload.id) {
          const { key = '' } = action.payload
          return { ...item, [key]: action.payload.value, hasChanged: true }
        }
        return item
      })

    case 'REPLACE_ALL':
      return orderBy(action.payload.data, 'afkorting')

    case 'CREATE_ITEM':
      return [...state, action.payload.newItem]

    case 'DELETE_ITEM':
      return state.filter((item) => item.id !== action.payload.id)

    case 'REPLACE_ITEM':
      return state.map((item) => {
        if (item.id === action.payload.id) {
          return action.payload.newItem
        }
        return item
      })

    default:
      return state
  }
}
