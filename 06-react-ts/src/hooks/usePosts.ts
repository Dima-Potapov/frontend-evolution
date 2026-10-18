import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/postsApi';
import type { CreatePostDto } from '../types/post';

// QueryKey — уникальный идентификатор запроса в кеше TanStack Query
// Используем as const чтобы TypeScript знал точный тип ['posts']
const POSTS_QUERY_KEY = ['posts'] as const;

// useQuery — для чтения данных (GET-запросы)
// Автоматически:
//   - кеширует результат
//   - повторяет запрос при ошибке
//   - обновляет данные при фокусе окна (refetchOnWindowFocus)
//   - отдаёт { data, isLoading, isError, error }
export function usePostsQuery() {
  return useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: postsApi.getPosts,
    // staleTime: как долго данные считаются "свежими" (не рефетчить)
    // 0 = всегда рефетчить (дефолт)
    staleTime: 0,
  });
}

// useMutation — для изменения данных (POST/PATCH/DELETE)
// После успеха: invalidateQueries() помечает кеш устаревшим → автоматический рефетч
// Это "оптимистичное" или "пессимистичное" обновление (здесь пессимистичное)
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => postsApi.createPost(data),
    onSuccess: () => {
      // Инвалидируем кеш → React Query перефетчит посты
      void queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postsApi.likePost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postsApi.deletePost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
}
