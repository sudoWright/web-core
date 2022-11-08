import { sanitizeMigratedAddressBook } from '@/services/ls-migration/addressBook'
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

export type AddressBook = { [address: string]: string }

export type AddressBookState = { [chainId: string]: AddressBook }

export const initialState: AddressBookState = {}

export const addressBookSlice = createSlice({
  name: 'addressBook',
  initialState,
  reducers: {
    migrate: (state, action: PayloadAction<AddressBookState>): AddressBookState => {
      // Don't migrate if there's data already
      if (Object.keys(state).length > 0) return state
      // Otherwise, migrate
      return action.payload
    },

    // Temporary post-migration fix for malformed data
    sanitize: (state): AddressBookState => sanitizeMigratedAddressBook(state),

    setAddressBook: (_, action: PayloadAction<AddressBookState>): AddressBookState => {
      return action.payload
    },

    upsertAddressBookEntry: (state, action: PayloadAction<{ chainId: string; address: string; name: string }>) => {
      const { chainId, address, name } = action.payload
      if (!state[chainId]) state[chainId] = {}
      state[chainId][address] = name
    },

    removeAddressBookEntry: (state, action: PayloadAction<{ chainId: string; address: string }>) => {
      const { chainId, address } = action.payload
      if (!state[chainId]) return state
      delete state[chainId][address]
    },
  },
})

export const { setAddressBook, upsertAddressBookEntry, removeAddressBookEntry } = addressBookSlice.actions

export const selectAllAddressBooks = (state: RootState): AddressBookState => {
  return state[addressBookSlice.name]
}

export const selectAddressBookByChain = createSelector(
  [selectAllAddressBooks, (_, chainId: string) => chainId],
  (allAddressBooks, chainId): AddressBook => {
    return chainId ? allAddressBooks[chainId] || {} : {}
  },
)
