const socket = io();

// Handle start sharing button click
document.getElementById('start-sharing').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter your name');
        return;
    }

    // Save username to localStorage
    localStorage.setItem('username', username);
    
    // Hide the form
    document.getElementById('name-form').style.display = 'none';

    startSharingLocation();
});

function startSharingLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            const username = localStorage.getItem('username');
            socket.emit('send-location', { latitude, longitude, username });
        }, (error) => {
            console.error(error);
        }, {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Function to generate a unique color for markers
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const map = L.map('map').setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Real Time Track'
}).addTo(map);

const markers = {};
const userColors = {}; // To store colors for each user

socket.on('receive-location', (data) => {
    const { id, username, latitude, longitude } = data;

    // Generate or retrieve color for this user
    if (!userColors[id]) {
        userColors[id] = getRandomColor(); // Assign a unique color
    }

    // Create a custom icon with the user color
    const customIcon = L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${userColors[id]}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid black;"></div>`,
        iconSize: [24, 24]
    });

    // Update or create the marker
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<strong>${username || 'Unknown'}</strong>`)
            .openPopup();
    }

    map.setView([latitude, longitude]);
});

socket.on('user-disconnected', (data) => {
    const { id } = data;
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        delete userColors[id]; // Remove the color reference
    }
});
