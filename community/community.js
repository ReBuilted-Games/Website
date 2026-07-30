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
                    const item = document.createElement('div');
                    item.className = 'card-item';
                    item.innerHTML = `
                        <h3>Latest Announcement (Shout)</h3>
                        <p class="meta">
                            Posted by ${data.shout.poster.displayName} (@${data.shout.poster.username})
                            on ${new Date(data.shout.updated).toLocaleDateString()}
                        </p>
                        <p>${data.shout.body}</p>
                    `;
                    announcementsList.appendChild(item);
                } else {
                    announcementsList.innerHTML = '<p>No announcements have been posted.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching announcements:', error);
                announcementsList.innerHTML = '<p>Could not load announcements at this time.</p>';
            });
    }

    // Fetch announcements immediately and then every 60 seconds
    fetchAnnouncements();
    setInterval(fetchAnnouncements, 60000); // 60000 milliseconds = 1 minute
});