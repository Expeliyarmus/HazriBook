import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, School, ClassSession } from '../types';
import { SchoolStorage } from '../utils/storage';

// Debug utility
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (action: string, data?: any) => {
  if (DEBUG) {
    console.log(`[AppContext] ${action}`, data);
  }
};

// Initial state
const initialState: AppState = {
  isAuthenticated: false,
  school: null,
  currentSession: null,
  loading: false,
  error: null,
};

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SCHOOL'; payload: School }
  | { type: 'LOGOUT' }
  | { type: 'SET_CURRENT_SESSION'; payload: ClassSession | null }
  | { type: 'INITIALIZE_APP' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  debugLog(`Action: ${action.type}`, 'payload' in action ? action.payload : undefined);

  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_SCHOOL':
      return {
        ...state,
        school: action.payload,
        isAuthenticated: true,
        error: null,
      };

    case 'LOGOUT':
      SchoolStorage.clear();
      return {
        ...initialState,
        isAuthenticated: false,
        school: null,
      };

    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };

    case 'INITIALIZE_APP':
      const school = SchoolStorage.get();
      return {
        ...state,
        school,
        isAuthenticated: !!school,
        loading: false,
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  login: (school: School) => void;
  logout: () => void;
  setCurrentSession: (session: ClassSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app on mount
  useEffect(() => {
    debugLog('Initializing app...');
    dispatch({ type: 'INITIALIZE_APP' });
  }, []);

  const contextValue: AppContextType = {
    state,
    login: (school: School) => {
      SchoolStorage.set(school);
      dispatch({ type: 'SET_SCHOOL', payload: school });
    },
    logout: () => {
      dispatch({ type: 'LOGOUT' });
    },
    setCurrentSession: (session: ClassSession | null) => {
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// Custom hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Export for debugging
if (DEBUG) {
  (window as any).appDebug = {
    getState: () => console.log('Current app state:', initialState),
  };
}
