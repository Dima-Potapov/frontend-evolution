import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// QueryClient — управляет кешем запросов (один на приложение)
// QueryClientProvider — передаёт клиент через React Context всем хукам
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

// Настройки по умолчанию для всех запросов
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // retry: сколько раз повторять запрос при ошибке
      retry: 1,
      // refetchOnWindowFocus: обновлять данные при возврате на вкладку
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// TypeScript: createRoot принимает HTMLElement (non-null), поэтому проверяем выше
createRoot(rootElement).render(
  <StrictMode>
    {/* QueryClientProvider оборачивает всё приложение — как и в Vue Pinia/Vuex */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
