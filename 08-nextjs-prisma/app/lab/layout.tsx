// Этот layout применяется ко всем страницам /lab/*
// Никакой особой логики — просто передаём children дальше.
// Стили и навигация встроены в каждую страницу лаборатории.
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
