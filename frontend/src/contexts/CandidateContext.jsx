import React, { createContext, useReducer, useContext } from 'react';

const CandidateContext = createContext(null); // Explicit null default

const candidateReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_CANDIDATES':
      return { ...state, candidates: [] };
    case 'SET_CANDIDATES':
      return { ...state, candidates: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export const CandidateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(candidateReducer, {
    candidates: []
  });

  return (
    <CandidateContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidateContext = () => {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error(
      'useCandidateContext must be used within a CandidateProvider - ' +
      'Did you forget to wrap your app in <CandidateProvider>?'
    );
  }
  return context;
};
