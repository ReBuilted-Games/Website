document.addEventListener('DOMContentLoaded', () => {
    // This is the public Roblox API endpoint for group details.
    // We use a proxy (roproxy.com) to avoid browser CORS errors.
    const groupId = 223811537; // Your group ID
    const apiUrl = `https://groups.roproxy.com/v1/groups/${groupId}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            // The API gives us the live group data.
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
    // The description can contain newlines, which we replace with <br> for proper HTML display.
    document.getElementById('group-description').innerHTML = data.description.replace(/\n/g, '<br>');
    document.getElementById('member-count').textContent = data.memberCount.toLocaleString();
    document.getElementById('group-link').href = `https://www.roblox.com/groups/${data.id}`;

    // The "shout" is the main group announcement.
    const announcementsList = document.getElementById('announcements-list');
    announcementsList.innerHTML = ''; // Clear any placeholder content

    // The API includes a 'shout' object for the latest announcement.
    if (data.shout) {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <h3>Latest Announcement</h3>
            <p class="meta">Posted by ${data.shout.poster.username} on ${new Date(data.shout.updated).toLocaleDateString()}</p>
            <p>${data.shout.body}</p>
        `;
        announcementsList.appendChild(item);
    }
}