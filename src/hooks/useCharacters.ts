import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersApi } from '../api/characters.api';

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: () => charactersApi.getAll(),
  });
}

export function useCharacterOne(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['character', id],
    queryFn: () => charactersApi.getOne(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useCharacterCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: charactersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}

export function useCharacterUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof charactersApi.update>[1];
    }) => charactersApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}

export function useCharacterDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => charactersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}

export function useCharacterUploadGif() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ characterId, file }: { characterId: string; file: File }) =>
      charactersApi.uploadGif(characterId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}

export function useCharacterRemoveGif() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      characterId,
      gifId,
    }: {
      characterId: string;
      gifId: string;
    }) => charactersApi.removeGif(characterId, gifId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['characters'] }),
  });
}
