// Подключаем типы Vite: благодаря этому TypeScript понимает импорты
// вида `import styles from './App.module.css'` (styles: Record<string, string>).
// Без этого файла `tsc` выдал бы ошибку "Cannot find module './App.module.css'".
/// <reference types="vite/client" />
