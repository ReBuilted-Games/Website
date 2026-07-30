document.addEventListener('DOMContentLoaded', () => {
    const groupId = 223811537; // Your group ID
    const apiUrl = `https://groups.roproxy.com/v1/groups/${groupId}`;

    const announcementsList = document.getElementById('announcements-list');

    function fetchAnnouncements() {
        console.log('Checking for new announcements...');
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response failed.');
                return response.json();
            })
            .then(data => {
                announcementsList.innerHTML = ''; // Clear previous announcement

                if (data.shout) {
                    const item = document.createElement('li');
                    item.className = 'announcement-item';
                    item.innerHTML = `
                        <span class="announcement-date">${new Date(data.shout.updated).toLocaleDateString()}</span>
                        <h3>Posted by ${data.shout.poster.displayName} (@${data.shout.poster.username})</h3>
                        <p>${data.shout.body}</p>
                    `;
                    announcementsList.appendChild(item);
                } else {
                    announcementsList.innerHTML = '<p>No announcements have been posted.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching announcements:', error);
                announcementsList.innerHTML = '<div class="alert error">Could not load announcements at this time.</div>';
            });
    }

    // Fetch announcements immediately and then every 60 seconds
    fetchAnnouncements();
    setInterval(fetchAnnouncements, 60000); // 60000 milliseconds = 1 minute
});