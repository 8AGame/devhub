import { Column, getColumnHeaderDetails } from '@devhub/core'
import { EMPTY_ARRAY, EMPTY_OBJ } from '../../utils/constants'
import { RootState } from '../types'
import { currentGitHubUsernameSelector } from './github'
import { createArraySelector, createDeepEqualSelector } from './helpers'
import { subscriptionSelector } from './subscriptions'

const s = (state: RootState) => state.columns || EMPTY_OBJ

export const columnSelector = (state: RootState, id: string) => {
  if (!id) return

  const byId = s(state).byId
  return (byId && byId[id]) || undefined
}

// export const columnIdsSelector = createSelector(
//   (state: RootState) => s(state).allIds || EMPTY_ARRAY,
//   columnIds => columnIds.slice(0, 2),
// )

export const columnIdsSelector = (state: RootState) =>
  s(state).allIds || EMPTY_ARRAY

export const columnsArrSelector = createArraySelector(
  (state: RootState) => columnIdsSelector(state),
  (state: RootState) => s(state).byId,
  (ids, byId): Column[] =>
    byId && ids
      ? (ids.map(id => byId[id]).filter(Boolean) as Column[])
      : EMPTY_ARRAY,
)

export const hasCreatedColumnSelector = (state: RootState) =>
  s(state).byId !== null

export const columnSubscriptionsSelector = createArraySelector(
  (state: RootState, columnId: string) => {
    const column = columnSelector(state, columnId)
    return (column && column.subscriptionIds) || EMPTY_ARRAY
  },
  (state: RootState) => state.subscriptions,
  (subscriptionIds, subscriptions) =>
    subscriptionIds
      .map(subscriptionId =>
        subscriptionSelector({ subscriptions } as any, subscriptionId),
      )
      .filter(Boolean),
)

export const columnSubscriptionSelector = (
  state: RootState,
  columnId: string,
) => columnSubscriptionsSelector(state, columnId).slice(-1)[0] || undefined

export const createColumnHeaderDetailsSelector = () =>
  createDeepEqualSelector(
    (state: RootState, columnId: string) => columnSelector(state, columnId),
    (state: RootState, columnId: string) => {
      const column = columnSelector(state, columnId)
      if (!column) return undefined

      const subscription = columnSubscriptionSelector(state, columnId)
      return subscription
    },
    (state: RootState, columnId: string) =>
      currentGitHubUsernameSelector(state),
    (column, subscription, loggedUsername) =>
      getColumnHeaderDetails(column, subscription, { loggedUsername }),
  )
