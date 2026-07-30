document.addEventListener('DOMContentLoaded', () => {
    // This is the public Roblox API endpoint for group details.
    // We use a proxy (roproxy.com) to avoid browser CORS errors.
    const groupId = 223811537; // Your group ID
    const groupApiUrl = `https://groups.roproxy.com/v1/groups/${groupId}`;
    
    fetch(groupApiUrl)
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
    // These elements only exist on the about page now
    const groupName = document.getElementById('group-name');
    if (groupName) groupName.textContent = data.name;
    
    const groupOwner = document.getElementById('group-owner');
    if (groupOwner) groupOwner.textContent = `Owned by ${data.owner.displayName} (@${data.owner.name})`;
    
    const groupDesc = document.getElementById('group-description');
    if (groupDesc) groupDesc.innerHTML = data.description.replace(/\n/g, '<br>');

    const memberCount = document.getElementById('member-count');
    if (memberCount) memberCount.textContent = data.memberCount.toLocaleString();

    const groupLink = document.getElementById('group-link');
    if (groupLink) groupLink.href = `https://www.roblox.com/groups/${data.id}`;
}