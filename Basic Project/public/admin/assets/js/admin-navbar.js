document.addEventListener('DOMContentLoaded', function() {
    // Load the navbar
    const navbarContainer = document.getElementById('navbar-container');
    
    if (navbarContainer) {
        fetch('./admin-navbar.html')
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
    
    // Mobile layout setup
    function setupMobileLayout() {
        if (window.innerWidth <= 768) {
            // Move search container out of nav-links and directly into navbar
            const navbarSearchContainer = navLinks.querySelector('.navbar-search-container');
            if (navbarSearchContainer) {
                navLinks.removeChild(navbarSearchContainer);
                document.querySelector('.navbar').appendChild(navbarSearchContainer);
            }
        } else {
            const navbarSearchContainer = document.querySelector('.navbar > .navbar-search-container');
            if (navbarSearchContainer && !navLinks.querySelector('.navbar-search-container')) {
                document.querySelector('.navbar').removeChild(navbarSearchContainer);
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
        
        link.addEventListener('click', function(e) {
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
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
        setupMobileLayout();
    });
}

function logoutAdmin() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/admin/admin-login.html";
}
