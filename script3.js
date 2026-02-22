document.addEventListener('DOMContentLoaded', () => {
    // STATE
    let cart = JSON.parse(localStorage.getItem('sashilok_cart')) || [];
    const body = document.body;
    const productsGrid = document.querySelector('.products-grid');

    // UI ELEMENTS - Filter Sidebar
    const filterSidebar = document.createElement('div');
    filterSidebar.className = 'filter-sidebar';
    filterSidebar.innerHTML = `
        <div class="filter-header">
            <h2>Filters</h2>
            <i class="fa-solid fa-xmark close-filter"></i>
        </div>
        <div class="filter-group">
            <label>Price Range</label>
            <div class="range-inputs">
                <input type="number" id="min-price" placeholder="Min $">
                <span>-</span>
                <input type="number" id="max-price" placeholder="Max $">
            </div>
            <button class="apply-filter-btn">Apply Filter</button>
            <button class="apply-filter-btn reset-filter-btn" style="background: transparent; color: #666; border: 1px solid #eee; margin-top: 10px;">Reset</button>
        </div>
    `;
    body.appendChild(filterSidebar);

    // Filter Overlay
    const filterOverlay = document.createElement('div');
    filterOverlay.className = 'filter-overlay';
    body.appendChild(filterOverlay);

    // Navbar Elements (Search + Filter)
    const navRight = document.querySelector('.nav-right');
    const filterIcon = document.createElement('i');
    filterIcon.className = 'fa-solid fa-sliders filter-icon-btn';

    if (navRight) {
        navRight.insertBefore(filterIcon, navRight.firstChild);
    }

    const cartSidebar = document.createElement('div');
    cartSidebar.className = 'cart-sidebar';
    cartSidebar.innerHTML = `
        <div class="cart-header">
            <h2>Your Cart</h2>
            <i class="fa-solid fa-xmark close-cart"></i>
        </div>
        <div class="cart-items"></div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Total Amount:</span>
                <span class="total-price">$0.00</span>
            </div>
            <button class="checkout-btn">Proceed to Checkout</button>
        </div>
    `;
    body.appendChild(cartSidebar);

    // Cart Overlay
    const cartOverlay = document.createElement('div');
    cartOverlay.className = 'cart-overlay';
    body.appendChild(cartOverlay);

    // Navbar Search Container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <input type="text" placeholder="Search for luxury items...">
        <i class="fa-solid fa-xmark close-search-nav"></i>
    `;
    if (navRight) {
        navRight.parentNode.insertBefore(searchContainer, navRight);
    }

    // Search Results Overlay
    const searchResultsOverlay = document.createElement('div');
    searchResultsOverlay.className = 'search-results-overlay';
    searchResultsOverlay.innerHTML = `
        <div class="cart-header">
            <h2>Search Results</h2>
            <i class="fa-solid fa-xmark close-results"></i>
        </div>
        <div class="results-grid"></div>
    `;
    body.appendChild(searchResultsOverlay);

    // Checkout Modal
    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'checkout-modal';
    checkoutModal.innerHTML = `
        <i class="fa-solid fa-circle-check" style="font-size: 60px; color: var(--gold); margin-bottom: 20px;"></i>
        <h2>Thank You!</h2>
        <p>Your order has been received. Our concierge will contact you shortly to confirm bespoke details and shipping.</p>
        <button class="checkout-btn close-checkout">Back to Boutique</button>
    `;
    body.appendChild(checkoutModal);

    // REVEAL ON SCROLL
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - 150) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // NAVBAR
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // CART LOGIC
    const updateCartUI = () => {
        const cartItemsContainer = cartSidebar.querySelector('.cart-items');
        const totalPriceEl = cartSidebar.querySelector('.total-price');
        const badge = document.querySelector('.badge');

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-item" data-index="${index}">Remove</button>
            `;
            cartItemsContainer.appendChild(itemEl);
            total += item.price;
        });

        totalPriceEl.textContent = `$${total.toFixed(2)}`;
        if (badge) badge.textContent = cart.length;
        localStorage.setItem('sashilok_cart', JSON.stringify(cart));
    };

    // SEARCH LOGIC
    const executeSearch = (query) => {
        const resultsGrid = searchResultsOverlay.querySelector('.results-grid');
        resultsGrid.innerHTML = '';

        if (!productsGrid) return;

        const products = Array.from(productsGrid.querySelectorAll('.product-card'));
        const matches = products.filter(p => p.querySelector('h3').textContent.toLowerCase().includes(query.toLowerCase()));

        if (matches.length > 0) {
            matches.forEach(p => {
                const clone = p.cloneNode(true);
                clone.classList.remove('reveal');
                clone.style.opacity = '1';
                clone.style.transform = 'none';
                resultsGrid.appendChild(clone);
            });
            searchResultsOverlay.classList.add('active');
        } else {
            resultsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No exquisite pieces found matching your search.</p>';
            searchResultsOverlay.classList.add('active');
        }
    };

    // FILTER LOGIC
    const filterProducts = (min, max) => {
        if (!productsGrid) return;
        const products = productsGrid.querySelectorAll('.product-card');
        let found = false;

        products.forEach(p => {
            const priceText = p.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

            if (price >= min && price <= max) {
                p.style.display = 'block';
                found = true;
            } else {
                p.style.display = 'none';
            }
        });
    };

    // EVENT DELEGATION
    body.addEventListener('click', (e) => {
        // Filter Toggle
        if (e.target.classList.contains('filter-icon-btn')) {
            filterSidebar.classList.add('active');
            filterOverlay.classList.add('active');
        }

        // Close Filter / Sidebar / Overlay
        if (e.target.classList.contains('close-filter') ||
            e.target.classList.contains('filter-overlay') ||
            e.target.classList.contains('close-cart') ||
            e.target.classList.contains('cart-overlay')) {

            filterSidebar.classList.remove('active');
            filterOverlay.classList.remove('active');
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            checkoutModal.classList.remove('active');
            searchResultsOverlay.classList.remove('active');
        }

        // Apply Filter
        if (e.target.classList.contains('apply-filter-btn') && !e.target.classList.contains('reset-filter-btn')) {
            const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
            const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

            filterProducts(minPrice, maxPrice);
            filterSidebar.classList.remove('active');
            filterOverlay.classList.remove('active');
        }

        // Reset Filter
        if (e.target.classList.contains('reset-filter-btn')) {
            document.getElementById('min-price').value = '';
            document.getElementById('max-price').value = '';
            filterProducts(0, Infinity);
            filterSidebar.classList.remove('active');
            filterOverlay.classList.remove('active');
        }

        // Add to Cart
        if (e.target.classList.contains('minimal-add-button')) {
            const card = e.target.closest('.product-card') || e.target.closest('.product-info');
            const name = card.querySelector('h3').textContent;
            const priceText = card.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

            cart.push({ name, price });
            updateCartUI();

            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        }

        // Toggle Cart Icon
        if (e.target.closest('.cart-icon')) {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        }

        // Remove Item
        if (e.target.classList.contains('remove-item')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            updateCartUI();
        }

        // Checkout Button
        if (e.target.classList.contains('checkout-btn') && !e.target.classList.contains('close-checkout')) {
            if (cart.length > 0) {
                checkoutModal.classList.add('active');
                cartOverlay.classList.add('active');
            } else {
                alert('Your cart is currently empty.');
            }
        }

        if (e.target.classList.contains('close-checkout')) {
            checkoutModal.classList.remove('active');
            cartOverlay.classList.remove('active');
            cart = [];
            updateCartUI();
        }

        // Search Toggle (Navbar)
        if (e.target.classList.contains('fa-magnifying-glass')) {
            searchContainer.classList.add('active');
            searchContainer.querySelector('input').focus();
        }

        if (e.target.classList.contains('close-search-nav')) {
            searchContainer.classList.remove('active');
        }

        // Close search results
        if (e.target.classList.contains('close-results')) {
            searchResultsOverlay.classList.remove('active');
            cartOverlay.classList.remove('active');
        }

        // Wishlist Feedback
        if (e.target.classList.contains('fa-heart')) {
            e.target.classList.toggle('fa-solid');
            e.target.classList.toggle('fa-regular');
            e.target.style.color = e.target.classList.contains('fa-solid') ? '#ff4d4d' : 'inherit';
        }
    });

    // Search input Enter key
    searchContainer.querySelector('input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                executeSearch(query);
                searchContainer.classList.remove('active');
                cartOverlay.classList.add('active');
            }
        }
    });

    // INITIAL RENDER
    updateCartUI();

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
