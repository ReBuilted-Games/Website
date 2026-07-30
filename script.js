document.addEventListener('DOMContentLoaded', () => {
    // This is the public Roblox API endpoint for group details.
    // We use a proxy (roproxy.com) to avoid browser CORS errors.
    const groupId = 223811537; // Your group ID
    const groupApiUrl = `https://groups.roproxy.com/v1/groups/${groupId}`;
    const iconApiUrl = `https://thumbnails.roproxy.com/v1/groups/icons?groupIds=${groupId}&size=150x150&format=Png&isCircular=false`;
    
    // Use Promise.all to fetch both group details and icon in parallel for better performance
    Promise.all([
        fetch(groupApiUrl).then(res => {
            if (!res.ok) throw new Error(`Group API response failed: ${res.statusText}`);
            return res.json();
        }),
        fetch(iconApiUrl).then(res => {
            if (!res.ok) throw new Error(`Icon API response failed: ${res.statusText}`);
            return res.json();
        })
    ]).then(([groupData, iconData]) => {
        populatePage(groupData, iconData);
    }).catch(error => {
        console.error('Error fetching group data:', error);
        const panel = document.querySelector('.panel');
        if (panel) {
            panel.innerHTML = `<div class="alert error">Could not load group information. The Roblox API might be down.</div>`;
        }
    });
});

function populatePage(groupData, iconData) {
    // Group Info
    // These elements only exist on the 'about' page
    const groupName = document.getElementById('group-name');
    if (groupName) groupName.textContent = groupData.name;
    
    const groupOwner = document.getElementById('group-owner');
    if (groupOwner) groupOwner.textContent = `Owned by ${groupData.owner.displayName} (@${groupData.owner.name})`;
    
    const groupDesc = document.getElementById('group-description');
    if (groupDesc) groupDesc.innerHTML = groupData.description.replace(/\n/g, '<br>');

    const memberCount = document.getElementById('member-count');
    if (memberCount) memberCount.textContent = groupData.memberCount.toLocaleString();

    const groupLink = document.getElementById('group-link');
    if (groupLink) groupLink.href = `https://www.roblox.com/groups/${groupData.id}`;

    const groupIcon = document.getElementById('group-icon');
    if (groupIcon && iconData.data && iconData.data.length > 0) {
        groupIcon.src = iconData.data[0].imageUrl;
        // Remove the placeholder background once the image is loaded
        groupIcon.style.background = 'none';
    }
}