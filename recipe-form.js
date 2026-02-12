// Recipe Form Handler for OpenRecipe
// Handles create and edit recipe forms

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Recipe form handler initialized');
    
    // Initialize recipe form based on current page
    initializeRecipeForm();
});

// Main initialization function
function initializeRecipeForm() {
    const path = window.location.pathname;
    
    if (path.includes('create-recipe.html')) {
        // Create new recipe form
        setupCreateForm();
    } else if (path.includes('edit-recipe.html')) {
        // Edit existing recipe form
        setupEditForm();
    }
}

// Setup create recipe form
function setupCreateForm() {
    const form = document.getElementById('recipeForm');
    if (!form) return;
    
    // Initialize form state
    const formState = {
        ingredients: [''],
        instructions: [''],
        tags: []
    };
    
    // Setup form sections
    setupIngredientsSection(form, formState);
    setupInstructionsSection(form, formState);
    setupTagsSection(form, formState);
    setupImagePreview(form);
    
    // Handle form submission
    setupFormSubmission(form, formState, false);
    
    // Setup form validation
    setupFormValidation(form);
}

// Setup edit recipe form
function setupEditForm() {
    const form = document.getElementById('recipeForm');
    if (!form) return;
    
    // Get recipe ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (!recipeId) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize form state
    const formState = {
        id: recipeId,
        ingredients: [],
        instructions: [],
        tags: []
    };
    
    // Load recipe data
    loadRecipeData(recipeId, form, formState);
}

// Load recipe data for editing
async function loadRecipeData(recipeId, form, formState) {
    try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        submitButton.disabled = true;
        
        // Get recipe from localStorage
        const recipes = await getRecipes();
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            throw new Error('Recipe not found');
        }
        
        // Populate form fields
        populateFormFields(form, recipe, formState);
        
        // Setup form sections with loaded data
        setupIngredientsSection(form, formState);
        setupInstructionsSection(form, formState);
        setupTagsSection(form, formState);
        setupImagePreview(form);
        
        // Setup form submission
        setupFormSubmission(form, formState, true);
        
        // Setup form validation
        setupFormValidation(form);
        
        // Restore button
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
    } catch (error) {
        console.error('Error loading recipe:', error);
        alert('Failed to load recipe. Redirecting to home page...');
        window.location.href = 'index.html';
    }
}

// Populate form fields with recipe data
function populateFormFields(form, recipe, formState) {
    // Basic fields
    const fields = ['title', 'description', 'prepTime', 'cookTime', 'servings', 'difficulty', 'category', 'imageUrl'];
    fields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && recipe[field] !== undefined) {
            input.value = recipe[field];
        }
    });
    
    // Complex fields
    formState.ingredients = recipe.ingredients || [''];
    formState.instructions = recipe.instructions || [''];
    formState.tags = recipe.tags || [];
    
    // Set recipe ID in hidden field
    const idInput = form.querySelector('[name="id"]');
    if (idInput) {
        idInput.value = recipe.id;
    }
}

// Setup ingredients section
function setupIngredientsSection(form, formState) {
    const container = form.querySelector('#ingredientsContainer');
    const addButton = form.querySelector('#addIngredient');
    
    if (!container) return;
    
    // Render initial ingredients
    renderIngredients(container, formState.ingredients);
    
    // Add ingredient button
    if (addButton) {
        addButton.addEventListener('click', function() {
            formState.ingredients.push('');
            renderIngredients(container, formState.ingredients);
        });
    }
    
    // Handle ingredient removal
    container.addEventListener('click', function(e) {
        if (e.target.closest('.remove-ingredient')) {
            const index = parseInt(e.target.closest('.remove-ingredient').dataset.index);
            if (formState.ingredients.length > 1) {
                formState.ingredients.splice(index, 1);
                renderIngredients(container, formState.ingredients);
            }
        }
    });
    
    // Handle ingredient input changes
    container.addEventListener('input', function(e) {
        if (e.target.classList.contains('ingredient-input')) {
            const index = parseInt(e.target.dataset.index);
            formState.ingredients[index] = e.target.value;
        }
    });
}

// Render ingredients list
function renderIngredients(container, ingredients) {
    container.innerHTML = ingredients.map((ingredient, index) => `
        <div class="form-row ingredient-row">
            <div class="form-group flex-1">
                <div class="input-with-icon">
                    <i class="fas fa-circle" style="font-size: 8px; color: #6b7280;"></i>
                    <input 
                        type="text" 
                        class="form-control ingredient-input"
                        placeholder="Ingredient ${index + 1}"
                        value="${ingredient || ''}"
                        data-index="${index}"
                        required="${index === 0}"
                    >
                </div>
            </div>
            ${ingredients.length > 1 ? `
                <div class="form-group" style="width: 60px;">
                    <button 
                        type="button" 
                        class="btn btn-danger remove-ingredient"
                        data-index="${index}"
                        title="Remove ingredient"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Setup instructions section
function setupInstructionsSection(form, formState) {
    const container = form.querySelector('#instructionsContainer');
    const addButton = form.querySelector('#addInstruction');
    
    if (!container) return;
    
    // Render initial instructions
    renderInstructions(container, formState.instructions);
    
    // Add instruction button
    if (addButton) {
        addButton.addEventListener('click', function() {
            formState.instructions.push('');
            renderInstructions(container, formState.instructions);
        });
    }
    
    // Handle instruction removal
    container.addEventListener('click', function(e) {
        if (e.target.closest('.remove-instruction')) {
            const index = parseInt(e.target.closest('.remove-instruction').dataset.index);
            if (formState.instructions.length > 1) {
                formState.instructions.splice(index, 1);
                renderInstructions(container, formState.instructions);
            }
        }
    });
    
    // Handle instruction input changes
    container.addEventListener('input', function(e) {
        if (e.target.classList.contains('instruction-input')) {
            const index = parseInt(e.target.dataset.index);
            formState.instructions[index] = e.target.value;
        }
    });
}

// Render instructions list
function renderInstructions(container, instructions) {
    container.innerHTML = instructions.map((instruction, index) => `
        <div class="form-row instruction-row">
            <div class="form-group flex-1">
                <div class="input-with-icon">
                    <span class="step-number">${index + 1}</span>
                    <textarea 
                        class="form-control instruction-input"
                        placeholder="Step ${index + 1}"
                        rows="2"
                        data-index="${index}"
                        required="${index === 0}"
                    >${instruction || ''}</textarea>
                </div>
            </div>
            ${instructions.length > 1 ? `
                <div class="form-group" style="width: 60px;">
                    <button 
                        type="button" 
                        class="btn btn-danger remove-instruction"
                        data-index="${index}"
                        title="Remove step"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Setup tags section
function setupTagsSection(form, formState) {
    const container = form.querySelector('#tagsContainer');
    const input = form.querySelector('#tagInput');
    const addButton = form.querySelector('#addTag');
    
    if (!container || !input || !addButton) return;
    
    // Render initial tags
    renderTags(container, formState.tags);
    
    // Add tag button
    addButton.addEventListener('click', function() {
        addTag(input, formState.tags, container);
    });
    
    // Add tag on Enter key
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input, formState.tags, container);
        }
    });
    
    // Handle tag removal
    container.addEventListener('click', function(e) {
        if (e.target.closest('.remove-tag')) {
            const tag = e.target.closest('.remove-tag').dataset.tag;
            removeTag(tag, formState.tags, container);
        }
    });
}

// Add a new tag
function addTag(input, tags, container) {
    const tag = input.value.trim().toLowerCase();
    
    if (tag && !tags.includes(tag)) {
        tags.push(tag);
        renderTags(container, tags);
        input.value = '';
        input.focus();
    }
}

// Remove a tag
function removeTag(tagToRemove, tags, container) {
    const index = tags.indexOf(tagToRemove);
    if (index > -1) {
        tags.splice(index, 1);
        renderTags(container, tags);
    }
}

// Render tags
function renderTags(container, tags) {
    container.innerHTML = `
        <div class="tags-display">
            ${tags.map(tag => `
                <span class="tag">
                    ${tag}
                    <button 
                        type="button" 
                        class="remove-tag" 
                        data-tag="${tag}"
                        title="Remove tag"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `).join('')}
            ${tags.length === 0 ? '<p class="text-gray-500 text-sm">No tags added yet</p>' : ''}
        </div>
    `;
}

// Setup image preview
function setupImagePreview(form) {
    const imageUrlInput = form.querySelector('[name="imageUrl"]');
    const previewContainer = form.querySelector('#imagePreview');
    
    if (!imageUrlInput || !previewContainer) return;
    
    // Create preview element if it doesn't exist
    if (!previewContainer.querySelector('.image-preview')) {
        previewContainer.innerHTML = `
            <div class="image-preview">
                <div class="preview-placeholder">
                    <i class="fas fa-image"></i>
                    <p>Image preview will appear here</p>
                </div>
                <img src="" alt="Preview" class="preview-image hidden">
            </div>
        `;
    }
    
    const previewImage = previewContainer.querySelector('.preview-image');
    const previewPlaceholder = previewContainer.querySelector('.preview-placeholder');
    
    // Update preview on input change
    imageUrlInput.addEventListener('input', function() {
        const url = this.value.trim();
        
        if (isValidImageUrl(url)) {
            previewImage.src = url;
            previewImage.classList.remove('hidden');
            previewPlaceholder.classList.add('hidden');
        } else {
            previewImage.classList.add('hidden');
            previewPlaceholder.classList.remove('hidden');
        }
    });
    
    // Initial preview if URL exists
    if (imageUrlInput.value) {
        imageUrlInput.dispatchEvent(new Event('input'));
    }
}

// Validate image URL
function isValidImageUrl(url) {
    if (!url) return false;
    
    // Basic URL validation
    try {
        new URL(url);
    } catch {
        return false;
    }
    
    // Check for common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
}

// Setup form validation
function setupFormValidation(form) {
    form.addEventListener('submit', function(e) {
        // Basic validation
        const title = form.querySelector('[name="title"]').value.trim();
        const description = form.querySelector('[name="description"]').value.trim();
        
        if (!title || !description) {
            e.preventDefault();
            alert('Please fill in the title and description');
            return;
        }
        
        // Validate at least one ingredient and instruction
        const ingredientInputs = form.querySelectorAll('.ingredient-input');
        const instructionInputs = form.querySelectorAll('.instruction-input');
        
        const hasIngredients = Array.from(ingredientInputs).some(input => input.value.trim());
        const hasInstructions = Array.from(instructionInputs).some(input => input.value.trim());
        
        if (!hasIngredients || !hasInstructions) {
            e.preventDefault();
            alert('Please add at least one ingredient and one instruction');
            return;
        }
    });
}

// Setup form submission
function setupFormSubmission(form, formState, isEdit) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get submit button
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        try {
            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitButton.disabled = true;
            
            // Get form data
            const formData = new FormData(form);
            const recipeData = {
                title: formData.get('title').trim(),
                description: formData.get('description').trim(),
                prepTime: parseInt(formData.get('prepTime')) || 0,
                cookTime: parseInt(formData.get('cookTime')) || 0,
                servings: parseInt(formData.get('servings')) || 1,
                difficulty: formData.get('difficulty') || 'Easy',
                category: formData.get('category') || 'Other',
                ingredients: formState.ingredients.filter(i => i.trim() !== ''),
                instructions: formState.instructions.filter(i => i.trim() !== ''),
                tags: formState.tags,
                imageUrl: formData.get('imageUrl')?.trim() || '',
                createdAt: new Date().toISOString()
            };
            
            // Validate required fields
            if (!recipeData.title || !recipeData.description) {
                throw new Error('Title and description are required');
            }
            
            if (recipeData.ingredients.length === 0 || recipeData.instructions.length === 0) {
                throw new Error('Please add at least one ingredient and one instruction');
            }
            
            // Get existing recipes
            const recipes = await getRecipes();
            
            if (isEdit) {
                // Update existing recipe
                const recipeId = formData.get('id');
                const index = recipes.findIndex(r => r.id === recipeId);
                
                if (index === -1) {
                    throw new Error('Recipe not found');
                }
                
                // Preserve original creation date
                recipeData.createdAt = recipes[index].createdAt;
                recipeData.id = recipeId;
                
                recipes[index] = recipeData;
            } else {
                // Create new recipe
                recipeData.id = Date.now().toString();
                recipes.unshift(recipeData);
            }
            
            // Save to localStorage
            localStorage.setItem('openrecipe_recipes', JSON.stringify(recipes));
            
            // Show success message
            alert(isEdit ? 'Recipe updated successfully!' : 'Recipe created successfully!');
            
            // Redirect to recipe detail page
            setTimeout(() => {
                window.location.href = `recipe-detail.html?id=${recipeData.id}`;
            }, 1000);
            
        } catch (error) {
            console.error('Error saving recipe:', error);
            
            // Show error message
            alert(`Error: ${error.message}`);
            
            // Restore button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// Get recipes from localStorage (same as main.js)
async function getRecipes() {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const recipesJson = localStorage.getItem('openrecipe_recipes');
                if (recipesJson) {
                    resolve(JSON.parse(recipesJson));
                } else {
                    resolve([]);
                }
            } catch (error) {
                console.error('Error loading recipes:', error);
                resolve([]);
            }
        }, 100);
    });
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeRecipeForm,
        setupCreateForm,
        setupEditForm,
        getRecipes
    };
}