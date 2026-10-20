// Shared favorites types — used by FavoritesContext, useFavorites, and
// any component that shows or toggles a favorite.

export interface FavoriteItem {
  productId: string;
  name: string;
  price: number;
  discount: number;
  imageUrl?: string;
}

export interface FavoritesContextValue {
  favorites: FavoriteItem[];
  favoritesCount: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (productId: string) => void;
  isHydrated: boolean;
}