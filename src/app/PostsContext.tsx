import { createContext, useContext, useState, ReactElement, ReactNode } from "react";

interface PostsContextType {
  likedIds: Set<string>;
  savedIds: Set<string>;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
}

type PostsProviderProps = {
  children: ReactNode;
};

const PostsContext = createContext<PostsContextType>({
  likedIds: new Set(),
  savedIds: new Set(),
  toggleLike: () => {},
  toggleSave: () => {},
});

export function PostsProvider({ children }: PostsProviderProps): ReactElement {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) =>
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSave = (id: string) =>
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <PostsContext.Provider value={{ likedIds, savedIds, toggleLike, toggleSave }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsCtx() {
  return useContext(PostsContext);
}
