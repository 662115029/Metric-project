document.addEventListener('DOMContentLoaded', function() {
    // Load the navbar
    const navbarContainer = document.getElementById('navbar-container');
    
    if (navbarContainer) {
        fetch('navbar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load navbar');
                }
                return response.text();
            })
            .then(html => {
                navbarContainer.innerHTML = html;
                // Initialize navbar functionality after loading
                initializeNavbar();
            })
            .catch(error => {
                console.error('Error loading navbar:', error);
                navbarContainer.innerHTML = '<p>Error loading navigation menu</p>';
            });
    }
});

// Initialize navbar functionality
function initializeNavbar() {
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const searchContainer = document.querySelector('.navbar-search-container');
    
    // Function to move the search container based on screen size
    function setupMobileLayout() {
        if (window.innerWidth <= 768) {
            // Move search container out of nav-links and directly into navbar
            const navbarSearchContainer = navLinks.querySelector('.navbar-search-container');
            if (navbarSearchContainer) {
                navLinks.removeChild(navbarSearchContainer);
                document.querySelector('.navbar').appendChild(navbarSearchContainer);
            }
        } else {
            // On desktop, ensure search is back in nav-links if it was moved
            const navbarSearchContainer = document.querySelector('.navbar > .navbar-search-container');
            if (navbarSearchContainer && !navLinks.querySelector('.navbar-search-container')) {
                document.querySelector('.navbar').removeChild(navbarSearchContainer);
                // Find the appropriate position in nav-links (after "Categories" link)
                const categoryItem = Array.from(navLinks.children).find(li => 
                    li.querySelector('a[href="categories.html"]'));
                if (categoryItem) {
                    navLinks.insertBefore(navbarSearchContainer, categoryItem.nextSibling);
                } else {
                    navLinks.appendChild(navbarSearchContainer);
                }
            }
        }
    }
    
    // Run on page load
    setupMobileLayout();
    
    // Toggle mobile menu
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Handle dropdown menus on mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // For mobile: toggle dropdown on click instead of hover
        link.addEventListener('click', function(e) {
            // Only apply this behavior on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                menu.classList.toggle('show');
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks && mobileMenu && !navLinks.contains(e.target) && !mobileMenu.contains(e.target) && navLinks.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Close mobile menu when window is resized to desktop
    window.addEventListener('resize', function() {
        if (navLinks && mobileMenu && window.innerWidth > 768 && navLinks.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
            // Remove any show classes from dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
        // Adjust layout when resizing
        setupMobileLayout();
    });

        // Logout functionality
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', function() {
                // Clear user-related data (e.g., token, userId) from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                alert('You have been logged out.');
                // Redirect to the login page
                window.location.href = '/login.html';
            });
        }
    }

    logoutButton.addEventListener('click', function() {
        // Clear stored tokens and user data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('token'); // Clear sessionStorage if used
    
        // Optionally notify the backend (token blacklist system)
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    
        alert('You have been logged out.');
        window.location.href = '/login.html'; // Redirect to login page
    });
    