import React, { Reducer, useContext, useEffect } from 'react'

import { Branche, IApiError, IBrancheAction, IMarktGenericContext, IQueryContext } from '../models'
import { useCreateGenericBranche } from '../hooks'
import { MarktGenericContext } from '../components/providers/MarktGenericDataProvider'
import { itemReducer as genericBranchesReducer } from '../reducers'
import GenericBranche from '../components/GenericBranche'
import { AddButton } from '../components/buttons'
import { networkErrorNotification } from '../common/notifications'

const initialBranche: Omit<Branche, 'id'> = {
  afkorting: '',
  omschrijving: '',
  color: '',
}

const initialBranches = Array(20)
  .fill(initialBranche)
  .map((branche, id) => ({ ...branche, id }))

const BrancheListPage = () => {
  const context = useContext(MarktGenericContext) as IMarktGenericContext & IQueryContext
  const { mutateAsync: createGenericBranche, isLoading: createInProgress } = useCreateGenericBranche()
  const [branches, dispatch] = React.useReducer(
    genericBranchesReducer as unknown as Reducer<Branche[], IBrancheAction>,
    []
  )

  useEffect(() => {
    const payload = { data: context.genericBranches }
    dispatch({ type: 'REPLACE_ALL', payload })
  }, [context.isSuccess, context.genericBranches])

  const brancheRows = (context.isLoading ? initialBranches : branches).map((branche) => {
    return <GenericBranche key={branche.id} dispatch={dispatch} isLoading={context.isLoading} {...branche} />
  })

  const createBranche = async () => {
    try {
      const response = await createGenericBranche(initialBranche)
      const payload = { newItem: response }
      dispatch({ type: 'CREATE_ITEM', payload })
    } catch (error: any) {
      networkErrorNotification(error as IApiError)
    }
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Afkorting</th>
            <th>Omschrijving</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>{brancheRows}</tbody>
      </table>
      <AddButton inProgress={createInProgress} clickHandler={createBranche}>
        Branche toevoegen
      </AddButton>
    </>
  )
}

export default BrancheListPage
