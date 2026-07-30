document.addEventListener('DOMContentLoaded', () => {
    // In a real scenario, this URL would point to a live API endpoint.
    // For this project, we're using the local JSON file.
    const dataUrl = './data/group.json';

    fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            populatePage(data);
        })
        .catch(error => {
            console.error('Error fetching group data:', error);
            // You could display an error message to the user on the page
        });
});

function populatePage(data) {
    // Group Info
    document.getElementById('group-name').textContent = data.name;
    document.getElementById('group-owner').textContent = `Owned by ${data.owner.username}`;
    document.getElementById('group-description').textContent = data.description;
    document.getElementById('member-count').textContent = data.memberCount.toLocaleString();
    document.getElementById('group-link').href = data.groupLink;

    // Announcements
    const announcementsList = document.getElementById('announcements-list');
    announcementsList.innerHTML = ''; // Clear any placeholder content
    data.announcements.forEach(announcement => {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <h3>${announcement.title}</h3>
            <p class="meta">${announcement.date}</p>
            <p>${announcement.summary}</p>
        `;
        announcementsList.appendChild(item);
    });

    // Gallery
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    data.gallery.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Group Gallery Image';
        galleryGrid.appendChild(img);
    });

    // Forum Threads
    const forumThreads = document.getElementById('forum-threads');
    forumThreads.innerHTML = '';
    data.forumThreads.forEach(thread => {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <h3><a href="${thread.link}" target="_blank" rel="noopener noreferrer">${thread.title}</a></h3>
            <p class="meta">${thread.comments}</p>
        `;
        forumThreads.appendChild(item);
    });
}