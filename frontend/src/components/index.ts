// Layout components
export { default as Layout } from './layout/Layout';
export { default as Main } from './layout/Main';
export { default as Header } from './layout/Header';

// Common components
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { default as PageErrorBoundary } from './common/PageErrorBoundary';

// Feedback components
export { default as ErrorState } from './feedback/ErrorState';
export { default as LoadingState } from './feedback/LoadingState';
export { default as NotFound } from './feedback/NotFound';

// Feature components
export { default as CategoryGrid } from './features/CategoryGrid';
export { default as ListingGrid } from './features/ListingGrid';
export { default as ListingCard } from './features/ListingCard';
export { default as LocationSelector } from './features/LocationSelector';
export { default as LocationSelectorInline } from './features/LocationSelectorInline';
export { default as LocationPickerModal } from './features/LocationPickerModal';

// Page components
export { default as HomePage } from './pages/HomePage';
export { default as ItemPage } from './pages/ItemPage';

// Types
export type { Category } from './features/CategoryGrid';