// OpenRecipe - Premium Recipe Form Handler
// Enhanced with professional animations and user experience

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('✨ Recipe form handler initialized');
    initializeRecipeForm();
});

// Main initialization function
function initializeRecipeForm() {
    const path = window.location.pathname;
    
    if (path.includes('create-recipe.html')) {
        setupCreateForm();
        updatePageTitle('Create New Recipe', 'Share your culinary creation');
    } else if (path.includes('edit-recipe.html')) {
        setupEditForm();
        updatePageTitle('Edit Recipe', 'Update your recipe details');
    }
}

// Update page title with animation
function updatePageTitle(title, subtitle) {
    const header = document.querySelector('h1');
    if (header) {
        header.textContent = title;
        header.style.animation = 'slideInLeft 0.6s ease';
        
        // Add subtitle if exists
        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'text-secondary text-center mb-6';
        subtitleEl.style.cssText = `
            color: var(--text-tertiary);
            font-size: 1rem;
            margin-bottom: 2rem;
            animation: slideInRight 0.6s ease 0.2s both;
        `;
        subtitleEl.textContent = subtitle;
        header.parentNode.insertBefore(subtitleEl, header.nextSibling);
    }
}

// Setup create recipe form
function setupCreateForm() {
    const form = document.getElementById('recipeForm');
    if (!form) return;
    
    const formState = {
        ingredients: [''],
        instructions: [''],
        tags: []
    };
    
    setupIngredientsSection(form, formState);
    setupInstructionsSection(form, formState);
    setupTagsSection(form, formState);
    setupImagePreview(form);
    setupFormSubmission(form, formState, false);
    setupFormValidation(form);
    setupFormAnimations(form);
}

// Setup edit recipe form
function setupEditForm() {
    const form = document.getElementById('recipeForm');
    if (!form) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (!recipeId) {
        showNotification('Recipe ID not found', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }
    
    const formState = {
        id: recipeId,
        ingredients: [],
        instructions: [],
        tags: []
    };
    
    loadRecipeData(recipeId, form, formState);
}

// Load recipe data for editing
async function loadRecipeData(recipeId, form, formState) {
    try {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Show loading state with animation
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        submitButton.disabled = true;
        submitButton.style.animation = 'pulse 1.5s infinite';
        
        const recipes = await getRecipes();
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            throw new Error('Recipe not found');
        }
        
        populateFormFields(form, recipe, formState);
        
        setupIngredientsSection(form, formState);
        setupInstructionsSection(form, formState);
        setupTagsSection(form, formState);
        setupImagePreview(form);
        setupFormSubmission(form, formState, true);
        setupFormValidation(form);
        setupFormAnimations(form);
        
        // Restore button with animation
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        submitButton.style.animation = '';
        
        // Show success notification
        showNotification('Recipe loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading recipe:', error);
        showNotification('Failed to load recipe. Redirecting...', 'error');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Populate form fields with recipe data
function populateFormFields(form, recipe, formState) {
    const fields = ['title', 'description', 'prepTime', 'cookTime', 'servings', 'difficulty', 'category', 'imageUrl'];
    
    fields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && recipe[field] !== undefined) {
            input.value = recipe[field];
            
            // Add highlight animation
            input.style.animation = 'highlight 1s ease';
            setTimeout(() => {
                input.style.animation = '';
            }, 1000);
        }
    });
    
    formState.ingredients = recipe.ingredients || [''];
    formState.instructions = recipe.instructions || [''];
    formState.tags = recipe.tags || [];
    
    const idInput = form.querySelector('[name="id"]');
    if (idInput) {
        idInput.value = recipe.id;
    }
}

// Setup ingredients section with drag and drop
function setupIngredientsSection(form, formState) {
    const container = form.querySelector('#ingredientsContainer');
    const addButton = form.querySelector('#addIngredient');
    
    if (!container) return;
    
    renderIngredients(container, formState.ingredients);
    setupDragAndDrop(container, formState, 'ingredients');
    
    if (addButton) {
        addButton.addEventListener('click', function() {
            formState.ingredients.push('');
            renderIngredients(container, formState.ingredients);
            
            // Scroll to new ingredient with animation
            setTimeout(() => {
                const lastInput = container.querySelector('.ingredient-row:last-child input');
                if (lastInput) {
                    lastInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    lastInput.focus();
                    lastInput.style.animation = 'highlight 1s ease';
                }
            }, 100);
            
            // Show success hint
            showNotification('New ingredient added', 'success');
        });
    }
    
    container.addEventListener('click', function(e) {
        if (e.target.closest('.remove-ingredient')) {
            const index = parseInt(e.target.closest('.remove-ingredient').dataset.index);
            if (formState.ingredients.length > 1) {
                formState.ingredients.splice(index, 1);
                renderIngredients(container, formState.ingredients);
                showNotification('Ingredient removed', 'warning');
            }
        }
    });
    
    container.addEventListener('input', function(e) {
        if (e.target.classList.contains('ingredient-input')) {
            const index = parseInt(e.target.dataset.index);
            formState.ingredients[index] = e.target.value;
        }
    });
}

// Setup instructions section with drag and drop
function setupInstructionsSection(form, formState) {
    const container = form.querySelector('#instructionsContainer');
    const addButton = form.querySelector('#addInstruction');
    
    if (!container) return;
    
    renderInstructions(container, formState.instructions);
    setupDragAndDrop(container, formState, 'instructions');
    
    if (addButton) {
        addButton.addEventListener('click', function() {
            formState.instructions.push('');
            renderInstructions(container, formState.instructions);
            
            setTimeout(() => {
                const lastTextarea = container.querySelector('.instruction-row:last-child textarea');
                if (lastTextarea) {
                    lastTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    lastTextarea.focus();
                    lastTextarea.style.animation = 'highlight 1s ease';
                }
            }, 100);
            
            showNotification('New step added', 'success');
        });
    }
    
    container.addEventListener('click', function(e) {
        if (e.target.closest('.remove-instruction')) {
            const index = parseInt(e.target.closest('.remove-instruction').dataset.index);
            if (formState.instructions.length > 1) {
                formState.instructions.splice(index, 1);
                renderInstructions(container, formState.instructions);
                showNotification('Step removed', 'warning');
            }
        }
    });
    
    container.addEventListener('input', function(e) {
        if (e.target.classList.contains('instruction-input')) {
            const index = parseInt(e.target.dataset.index);
            formState.instructions[index] = e.target.value;
        }
    });
}

// Setup drag and drop for reordering
function setupDragAndDrop(container, formState, type) {
    let dragStartIndex;
    
    container.querySelectorAll('.ingredient-row, .instruction-row').forEach(row => {
        row.setAttribute('draggable', 'true');
        
        row.addEventListener('dragstart', function(e) {
            dragStartIndex = parseInt(this.dataset.index);
            this.style.opacity = '0.5';
            this.classList.add('dragging');
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', dragStartIndex);
        });
        
        row.addEventListener('dragend', function() {
            this.style.opacity = '';
            this.classList.remove('dragging');
        });
        
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            
            const dragEndIndex = parseInt(this.dataset.index);
            if (dragStartIndex !== dragEndIndex) {
                const items = formState[type];
                const [draggedItem] = items.splice(dragStartIndex, 1);
                items.splice(dragEndIndex, 0, draggedItem);
                
                if (type === 'ingredients') {
                    renderIngredients(container, items);
                } else {
                    renderInstructions(container, items);
                }
                
                showNotification('Item reordered', 'info');
            }
        });
    });
}

// Render ingredients with animations
function renderIngredients(container, ingredients) {
    container.innerHTML = ingredients.map((ingredient, index) => `
        <div class="form-row ingredient-row" data-index="${index}" style="animation: slideInLeft 0.3s ease ${index * 0.05}s both;">
            <div class="form-group flex-1">
                <div class="input-with-icon" style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-grip-vertical" style="color: var(--text-tertiary); cursor: grab;"></i>
                    <i class="fas fa-circle" style="font-size: 8px; color: var(--primary-500);"></i>
                    <input 
                        type="text" 
                        class="form-control ingredient-input"
                        placeholder="e.g., 2 cups flour"
                        value="${ingredient || ''}"
                        data-index="${index}"
                        ${index === 0 ? 'required' : ''}
                        style="flex: 1;"
                    >
                </div>
            </div>
            ${ingredients.length > 1 ? `
                <div class="form-group" style="width: 60px;">
                    <button 
                        type="button" 
                        class="btn btn-icon remove-ingredient"
                        data-index="${index}"
                        title="Remove ingredient"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Re-attach drag and drop
    setupDragAndDrop(container, { [container.id.includes('ingredient') ? 'ingredients' : 'instructions']: ingredients }, 
                    container.id.includes('ingredient') ? 'ingredients' : 'instructions');
}

// Render instructions with animations
function renderInstructions(container, instructions) {
    container.innerHTML = instructions.map((instruction, index) => `
        <div class="form-row instruction-row" data-index="${index}" style="animation: slideInRight 0.3s ease ${index * 0.05}s both;">
            <div class="form-group flex-1">
                <div class="input-with-icon" style="display: flex; align-items: flex-start; gap: 0.5rem;">
                    <i class="fas fa-grip-vertical" style="color: var(--text-tertiary); margin-top: 12px; cursor: grab;"></i>
                    <span class="step-number" style="min-width: 24px;">${index + 1}</span>
                    <textarea 
                        class="form-control instruction-input"
                        placeholder="Describe step ${index + 1}"
                        rows="2"
                        data-index="${index}"
                        ${index === 0 ? 'required' : ''}
                        style="flex: 1;"
                    >${instruction || ''}</textarea>
                </div>
            </div>
            ${instructions.length > 1 ? `
                <div class="form-group" style="width: 60px;">
                    <button 
                        type="button" 
                        class="btn btn-icon remove-instruction"
                        data-index="${index}"
                        title="Remove step"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Re-attach drag and drop
    setupDragAndDrop(container, { instructions }, 'instructions');
}

// Setup tags section
function setupTagsSection(form, formState) {
    const container = form.querySelector('#tagsContainer');
    const input = form.querySelector('#tagInput');
    const addButton = form.querySelector('#addTag');
    
    if (!container || !input || !addButton) return;
    
    renderTags(container, formState.tags);
    
    addButton.addEventListener('click', function() {
        addTag(input, formState.tags, container);
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input, formState.tags, container);
        }
    });
    
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
        
        // Add animation to new tag
        showNotification(`Tag "${tag}" added`, 'success');
    } else if (tags.includes(tag)) {
        showNotification('Tag already exists', 'warning');
        input.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
}

// Remove a tag
function removeTag(tagToRemove, tags, container) {
    const index = tags.indexOf(tagToRemove);
    if (index > -1) {
        tags.splice(index, 1);
        renderTags(container, tags);
        showNotification(`Tag "${tagToRemove}" removed`, 'warning');
    }
}

// Render tags
function renderTags(container, tags) {
    container.innerHTML = `
        <div class="tags-display" style="display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 50px; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-lg);">
            ${tags.map(tag => `
                <span class="tag" style="animation: scaleIn 0.3s ease;">
                    #${tag}
                    <button 
                        type="button" 
                        class="remove-tag" 
                        data-tag="${tag}"
                        title="Remove tag"
                        style="background: none; border: none; color: inherit; margin-left: 4px; cursor: pointer; padding: 2px 4px; border-radius: 4px;"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `).join('')}
            ${tags.length === 0 ? `
                <p style="color: var(--text-tertiary); font-size: 0.875rem; margin: 0;">
                    <i class="fas fa-info-circle"></i> No tags added yet. Add some tags to help others find your recipe!
                </p>
            ` : ''}
        </div>
    `;
}

// Setup image preview with advanced features
function setupImagePreview(form) {
    const imageUrlInput = form.querySelector('[name="imageUrl"]');
    const previewContainer = form.querySelector('#imagePreview');
    
    if (!imageUrlInput || !previewContainer) return;
    
    previewContainer.innerHTML = `
        <div class="image-preview" style="
            width: 100%;
            height: 300px;
            border: 2px dashed var(--border-medium);
            border-radius: var(--radius-2xl);
            overflow: hidden;
            margin-top: var(--space-2);
            background: var(--bg-secondary);
            position: relative;
            transition: all var(--transition-base);
        ">
            <div class="preview-placeholder" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: var(--text-tertiary);
            ">
                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Enter an image URL to preview</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Supports: JPG, PNG, GIF, WebP</p>
            </div>
            <img src="" alt="Recipe preview" class="preview-image" style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: none;
            ">
        </div>
    `;
    
    const previewImage = previewContainer.querySelector('.preview-image');
    const previewPlaceholder = previewContainer.querySelector('.preview-placeholder');
    const previewBox = previewContainer.querySelector('.image-preview');
    
    imageUrlInput.addEventListener('input', function() {
        const url = this.value.trim();
        
        if (isValidImageUrl(url)) {
            const img = new Image();
            img.onload = function() {
                previewImage.src = url;
                previewImage.style.display = 'block';
                previewPlaceholder.style.display = 'none';
                previewBox.style.borderColor = 'var(--success)';
                previewBox.style.animation = 'pulse 2s infinite';
                
                showNotification('Image loaded successfully', 'success');
            };
            img.onerror = function() {
                previewImage.style.display = 'none';
                previewPlaceholder.style.display = 'flex';
                previewBox.style.borderColor = 'var(--danger)';
                previewBox.style.animation = 'shake 0.5s ease';
                
                setTimeout(() => {
                    previewBox.style.animation = '';
                }, 500);
                
                showNotification('Invalid image URL', 'error');
            };
            img.src = url;
        } else {
            previewImage.style.display = 'none';
            previewPlaceholder.style.display = 'flex';
            previewBox.style.borderColor = 'var(--border-medium)';
            previewBox.style.animation = '';
        }
    });
    
    if (imageUrlInput.value) {
        imageUrlInput.dispatchEvent(new Event('input'));
    }
}

// Validate image URL
function isValidImageUrl(url) {
    if (!url) return false;
    
    try {
        new URL(url);
    } catch {
        return false;
    }
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
}

// Setup form animations
function setupFormAnimations(form) {
    // Add focus animations to all inputs
    form.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateX(8px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateX(0)';
        });
    });
    
    // Animate form sections on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    form.querySelectorAll('.form-group').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
        observer.observe(el);
    });
}

// Setup form validation with real-time feedback
function setupFormValidation(form) {
    const title = form.querySelector('[name="title"]');
    const description = form.querySelector('[name="description"]');
    
    if (title) {
        title.addEventListener('input', function() {
            if (this.value.length < 3) {
                this.style.borderColor = 'var(--warning)';
                this.setCustomValidity('Title must be at least 3 characters');
            } else {
                this.style.borderColor = 'var(--success)';
                this.setCustomValidity('');
            }
        });
    }
    
    if (description) {
        description.addEventListener('input', function() {
            if (this.value.length < 10) {
                this.style.borderColor = 'var(--warning)';
                this.setCustomValidity('Description must be at least 10 characters');
            } else {
                this.style.borderColor = 'var(--success)';
                this.setCustomValidity('');
            }
        });
    }
    
    form.addEventListener('submit', function(e) {
        const title = form.querySelector('[name="title"]').value.trim();
        const description = form.querySelector('[name="description"]').value.trim();
        
        if (!title || !description) {
            e.preventDefault();
            showNotification('Please fill in the title and description', 'error');
            return;
        }
        
        const ingredientInputs = form.querySelectorAll('.ingredient-input');
        const instructionInputs = form.querySelectorAll('.instruction-input');
        
        const hasIngredients = Array.from(ingredientInputs).some(input => input.value.trim());
        const hasInstructions = Array.from(instructionInputs).some(input => input.value.trim());
        
        if (!hasIngredients || !hasInstructions) {
            e.preventDefault();
            showNotification('Please add at least one ingredient and one instruction', 'error');
            return;
        }
    });
}

// Setup form submission
function setupFormSubmission(form, formState, isEdit) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        try {
            // Show loading state with animation
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitButton.disabled = true;
            submitButton.style.animation = 'pulse 1.5s infinite';
            
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
            
            if (!recipeData.title || !recipeData.description) {
                throw new Error('Title and description are required');
            }
            
            if (recipeData.ingredients.length === 0 || recipeData.instructions.length === 0) {
                throw new Error('Please add at least one ingredient and one instruction');
            }
            
            const recipes = await getRecipes();
            
            if (isEdit) {
                const recipeId = formData.get('id');
                const index = recipes.findIndex(r => r.id === recipeId);
                
                if (index === -1) {
                    throw new Error('Recipe not found');
                }
                
                recipeData.createdAt = recipes[index].createdAt;
                recipeData.id = recipeId;
                recipes[index] = recipeData;
                
                showNotification('Recipe updated successfully!', 'success');
            } else {
                recipeData.id = Date.now().toString();
                recipes.unshift(recipeData);
                
                showNotification('Recipe created successfully!', 'success');
            }
            
            localStorage.setItem('openrecipe_recipes', JSON.stringify(recipes));
            
            // Success animation
            submitButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
            submitButton.style.background = 'var(--success)';
            
            // Redirect with animation
            setTimeout(() => {
                document.body.style.opacity = '0';
                document.body.style.transform = 'translateY(20px)';
                document.body.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = `recipe-detail.html?id=${recipeData.id}`;
                }, 300);
            }, 1000);
            
        } catch (error) {
            console.error('Error saving recipe:', error);
            
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            submitButton.style.animation = '';
            submitButton.style.background = '';
            
            showNotification(`Error: ${error.message}`, 'error');
        }
    });
}

// Show notification (toast)
function showNotification(message, type = 'success') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        // Fallback to alert
        alert(message);
    }
}

// Get recipes from localStorage
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

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeRecipeForm,
        setupCreateForm,
        setupEditForm,
        getRecipes
    };
}

// Add shake animation for errors
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    @keyframes highlight {
        0%, 100% { background: transparent; }
        50% { background: rgba(16, 185, 129, 0.1); }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);