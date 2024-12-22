"use client";
// This directive marks the file as a client-side module in Next.js. Required for client-side rendering.

import { useRef } from "react";
// `useRef` is used to create a mutable reference for the Redux store, persisting across renders.

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
// `useDispatch` and `useSelector` are hooks for interacting with the Redux store.
// `TypedUseSelectorHook` allows type-safe access to the Redux state.

import { combineReducers, configureStore } from "@reduxjs/toolkit";
// `combineReducers` is used to merge multiple reducers into one root reducer.
// `configureStore` sets up the Redux store with sensible defaults and middleware.

import { Provider } from "react-redux";
// `Provider` wraps the application and provides the Redux store context.

import { setupListeners } from "@reduxjs/toolkit/query";
// Sets up automatic re-fetching and other listeners for Redux Query, enabling features like cache invalidation.

import globalReducer from "@/state";
// Importing a custom reducer from the `state` directory, used for managing global state.

import { api } from "@/state/api";
// Importing an API slice for managing server interactions using Redux Toolkit Query.

/* REDUX STORE */
const rootReducer = combineReducers({
  global: globalReducer, // Adding the `global` reducer to the Redux store.
  [api.reducerPath]: api.reducer, // Adding the API slice reducer under its defined reducer path.
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer, // Setting the root reducer for the store.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Configures default middleware with custom settings for serializable checks.
        serializableCheck: {
          ignoredActions: [
            "api/executeMutation/pending",
            "api/executeMutation/fulfilled",
            "api/executeMutation/rejected",
          ],
          // Actions from the API slice are ignored during serialization checks.
          ignoredActionPaths: [
            "meta.arg.originalArgs.file",
            "meta.arg.originalArgs.formData",
            "payload.chapter.video",
            "meta.baseQueryMeta.request",
            "meta.baseQueryMeta.response",
          ],
          // Specific paths in the action payloads are excluded from checks.
          ignoredPaths: [
            "global.courseEditor.sections",
            "entities.videos.data",
            "meta.baseQueryMeta.request",
            "meta.baseQueryMeta.response",
          ],
          // Certain paths in the Redux state are ignored for serialization checks.
        },
      }).concat(api.middleware),
      // Adds the API middleware to handle queries and mutations.
  });
};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
// Type representing the Redux store returned by `makeStore`.

export type RootState = ReturnType<AppStore["getState"]>;
// Type representing the shape of the entire Redux state.

export type AppDispatch = AppStore["dispatch"];
// Type for the `dispatch` function provided by the Redux store.

export const useAppDispatch = () => useDispatch<AppDispatch>();
// A custom hook for dispatching actions, typed to match the `AppDispatch` type.

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// A custom hook for selecting state from the store, typed to match the `RootState` type.

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode; // Declaring the type for the `children` prop, which will be React nodes.
}) {
  const storeRef = useRef<AppStore>();
  // Creating a mutable reference for the Redux store, ensuring it persists across renders.

  if (!storeRef.current) {
    // If the store hasn't been initialized, create it.
    storeRef.current = makeStore(); // Initialize the Redux store.
    setupListeners(storeRef.current.dispatch);
    // Set up Redux Query listeners for features like cache invalidation and background refetching.
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
  // Wraps the children components with the Redux `Provider`, passing down the store.
}
