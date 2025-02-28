import { create } from 'zustand';
import categoryAccounts from "../constants";

const useCategoryStore = create((set) => ({
    categories: categoryAccounts,

    // Fetch all categories
    getCategories: () => categoryAccounts,

    // Find a specific category by name
    getCategoryByName: (name) => {
        return categoryAccounts.find(category => category.name === name)
    },

    // Find a game by slug
    getGameBySlug: (slug) => {
        for (const category of categoryAccounts) {
            const game = category.games.find(game => game.slug === slug);
            if (game) return game;
        }
        return null;
    },

    // Add a new game to a category
    addGameToCategory: (categoryName, newGame) => set((state) => {
        return {
            categories: state.categories.map(category =>
                category.name === categoryName
                    ? { ...category, games: [...category.games, newGame] }
                    : category
            )
        };
    }),

    // Update a game by slug
    updateGame: (slug, updatedData) => set((state) => {
        return {
            categories: state.categories.map(category => ({
                ...category,
                games: category.games.map(game => 
                    game.slug === slug ? {...game, ...updatedData} : game
                )
            }))
        };
    }),
}));

export default useCategoryStore