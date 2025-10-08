const storeAddress = "1201 Mason St, San Francisco, CA 94108";
let map;
let geocoder;
let marker;

// Initialize and add the map
function initMap() {
    // Create a geocoder instance
    geocoder = new google.maps.Geocoder();
    
    // Default location (San Francisco) in case geocoding fails
    const defaultLocation = { lat: 37.7749, lng: -122.4194 };
    
    // Create the map first with default location
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: defaultLocation,
        mapTypeControl: true,
        streetViewControl: true,
        zoomControl: true
    });
    
    // Use the address stored in the variable to place the marker
    geocodeAddress(storeAddress);
}

// Function to geocode the address and place marker
function geocodeAddress(address) {
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status === 'OK') {
            // Center map on the geocoded location
            map.setCenter(results[0].geometry.location);
            
            // Add marker at the geocoded location
            marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                title: "Game Store",
                animation: google.maps.Animation.DROP
            });
            
            // Add info window with the address
            const infoWindow = new google.maps.InfoWindow({
                content: `<strong>Game Store</strong><br>${address}`
            });
            
            // Open info window when marker is clicked
            marker.addListener('click', function() {
                infoWindow.open(map, marker);
            });
            
            // Open info window by default
            infoWindow.open(map, marker);
            
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
            // Fall back to default coordinates if geocoding fails
            placeDefaultMarker();
        }
    });
}

// Fallback function to place marker at default location
function placeDefaultMarker() {
    const defaultLocation = { lat: 37.7749, lng: -122.4194 };
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Game Store"
    });
}

// Handle form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Here you would typically send this data to your server
    // For now, we'll just simulate a successful submission
    console.log({
        name,
        email,
        subject,
        message
    });
    
    // Show success message
    document.getElementById('successMessage').style.display = 'block';
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        document.getElementById('successMessage').style.display = 'none';
    }, 5000);
});