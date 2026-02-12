// js/api.js - Shared API functions

// Get recipes from localStorage
async function getRecipes() {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const recipesJson = localStorage.getItem('openrecipe_recipes');
                if (recipesJson) {
                    resolve(JSON.parse(recipesJson));
                } else {
                    // Initialize with sample recipes if none exist
                    const sampleRecipes = getSampleRecipes();
                    localStorage.setItem('openrecipe_recipes', JSON.stringify(sampleRecipes));
                    resolve(sampleRecipes);
                }
            } catch (error) {
                console.error('Error loading recipes:', error);
                resolve([]);
            }
        }, 300);
    });
}

// Get single recipe by ID
async function getRecipeById(id) {
    const recipes = await getRecipes();
    return recipes.find(recipe => recipe.id === id);
}

// Delete recipe
async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
        return;
    }
    
    try {
        const recipes = await getRecipes();
        const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
        
        localStorage.setItem('openrecipe_recipes', JSON.stringify(updatedRecipes));
        
        alert('Recipe deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
        return false;
    }
}

// Save recipe (create or update)
async function saveRecipe(recipeData, isEdit = false) {
    try {
        const recipes = await getRecipes();
        
        if (isEdit) {
            // Update existing recipe
            const index = recipes.findIndex(r => r.id === recipeData.id);
            if (index !== -1) {
                // Preserve creation date
                recipeData.createdAt = recipes[index].createdAt;
                recipes[index] = recipeData;
            } else {
                throw new Error('Recipe not found');
            }
        } else {
            // Create new recipe
            recipeData.id = Date.now().toString();
            recipeData.createdAt = new Date().toISOString();
            recipes.unshift(recipeData);
        }
        
        localStorage.setItem('openrecipe_recipes', JSON.stringify(recipes));
        return recipeData;
    } catch (error) {
        console.error('Error saving recipe:', error);
        throw error;
    }
}

// Search recipes
async function searchRecipes(query) {
    const recipes = await getRecipes();
    
    return recipes.filter(recipe => {
        const searchableText = `
            ${recipe.title || ''}
            ${recipe.description || ''}
            ${recipe.ingredients?.join(' ') || ''}
            ${recipe.tags?.join(' ') || ''}
            ${recipe.category || ''}
        `.toLowerCase();
        
        return searchableText.includes(query.toLowerCase());
    });
}

// Get recipes by category
async function getRecipesByCategory(category) {
    const recipes = await getRecipes();
    return recipes.filter(recipe => 
        recipe.category.toLowerCase() === category.toLowerCase()
    );
}

// Get sample recipes for initial setup
function getSampleRecipes() {
    return [
        {
            id: '1',
            title: 'Creamy Garlic Pasta',
            description: 'Delicious pasta with creamy garlic sauce, ready in 30 minutes',
            ingredients: [
                '400g pasta',
                '4 cloves garlic, minced',
                '200ml heavy cream',
                '100g grated parmesan',
                '2 tbsp butter',
                'Salt and pepper to taste',
                'Fresh parsley for garnish'
            ],
            instructions: [
                'Cook pasta according to package instructions until al dente',
                'While pasta cooks, melt butter in a large pan over medium heat',
                'Add minced garlic and sauté until fragrant (about 1 minute)',
                'Pour in heavy cream and bring to a simmer',
                'Stir in grated parmesan until melted and smooth',
                'Season with salt and pepper',
                'Drain pasta and add to the sauce, tossing to coat',
                'Garnish with fresh parsley and serve immediately'
            ],
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            difficulty: 'Easy',
            category: 'Dinner',
            tags: ['pasta', 'creamy', 'garlic', 'italian', 'quick'],
            imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop',
            notes: 'For a lighter version, use half-and-half instead of heavy cream',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Classic Chocolate Chip Cookies',
            description: 'Soft and chewy chocolate chip cookies everyone will love',
            ingredients: [
                '225g unsalted butter, softened',
                '200g brown sugar',
                '100g white sugar',
                '2 large eggs',
                '1 tsp vanilla extract',
                '350g all-purpose flour',
                '1 tsp baking soda',
                '1 tsp salt',
                '300g chocolate chips'
            ],
            instructions: [
                'Preheat oven to 180°C (350°F) and line baking sheets with parchment paper',
                'In a large bowl, cream together butter and sugars until light and fluffy',
                'Beat in eggs one at a time, then stir in vanilla',
                'In a separate bowl, combine flour, baking soda, and salt',
                'Gradually add dry ingredients to wet ingredients, mixing until just combined',
                'Fold in chocolate chips',
                'Drop rounded tablespoons of dough onto prepared baking sheets',
                'Bake for 10-12 minutes or until edges are golden brown',
                'Let cool on baking sheet for 5 minutes before transferring to wire rack'
            ],
            prepTime: 15,
            cookTime: 12,
            servings: 24,
            difficulty: 'Easy',
            category: 'Dessert',
            tags: ['cookies', 'chocolate', 'dessert', 'baking', 'sweet'],
            imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w-800&auto=format&fit=crop',
            notes: 'For extra chewy cookies, chill the dough for 30 minutes before baking',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

// Utility functions
function formatTime(minutes) {
    if (!minutes || minutes === 0) return 'N/A';
    
    if (minutes < 60) {
        return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
}

function getRecipeImage(recipe) {
    if (recipe.imageUrl) {
        return recipe.imageUrl;
    }
    
    const categoryImages = {
        'breakfast': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&auto=format&fit=crop',
        'lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
        'dinner': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
        'dessert': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop',
        'vegetarian': 'https://images.unsplash.com/photo-1540420828642-fca2c5c18abb?w=800&auto=format&fit=crop',
        'vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop'
    };
    
    return categoryImages[recipe.category?.toLowerCase()] || 
           'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop';
}

function getDifficultyClass(difficulty) {
    const classes = {
        'easy': 'difficulty-easy',
        'medium': 'difficulty-medium',
        'hard': 'difficulty-hard'
    };
    
    return classes[difficulty?.toLowerCase()] || 'difficulty-easy';
}