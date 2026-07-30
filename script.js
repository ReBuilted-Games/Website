document.addEventListener('DOMContentLoaded', () => {
    // This is the public Roblox API endpoint for group details.
    // We use a proxy (roproxy.com) to avoid browser CORS errors.
    const groupId = 223811537; // Your group ID
    const groupApiUrl = `https://groups.roproxy.com/v1/groups/${groupId}`;
    const iconApiUrl = `https://thumbnails.roproxy.com/v1/groups/icons?groupIds=${groupId}&size=150x150&format=Png&isCircular=false`;
    const socialLinksApiUrl = `https://groups.roproxy.com/v2/groups/${groupId}/social-links`;
    
    // Use Promise.all to fetch both group details and icon in parallel for better performance
    Promise.all([
        fetch(groupApiUrl).then(res => {
            if (!res.ok) throw new Error(`Group API response failed: ${res.statusText}`);
            return res.json();
        }),
        fetch(iconApiUrl).then(res => {
            if (!res.ok) throw new Error(`Icon API response failed: ${res.statusText}`);
            return res.json();
        }),
        fetch(socialLinksApiUrl).then(res => {
            // Gracefully handle if there are no social links or the API fails
            if (!res.ok) return { data: [] };
            return res.json();
        })
    ]).then(([groupData, iconData, socialLinksData]) => {
        populatePage(groupData, iconData, socialLinksData);
        // Swap visibility from skeleton to real content
        const skeleton = document.getElementById('skeleton-loader');
        const realContent = document.getElementById('real-content');
        if (skeleton) skeleton.style.display = 'none';
        if (realContent) {
            realContent.style.display = 'block';
            realContent.classList.add('fade-in');
        }
    }).catch(error => {
        console.error('Error fetching group data:', error);
        const panel = document.querySelector('.panel');
        if (panel) {
            // Hide skeleton on error and show message
            const skeleton = document.getElementById('skeleton-loader');
            if (skeleton) skeleton.style.display = 'none';
            panel.insertAdjacentHTML('afterbegin', `<div class="alert error">Could not load group information. The Roblox API might be down.</div>`);
        }
    });
});

function populatePage(groupData, iconData, socialLinksData) {
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

    // Social Links
    const pillRow = document.querySelector('.group-details .pill-row');
    if (pillRow && socialLinksData.data && socialLinksData.data.length > 0) {
        socialLinksData.data.forEach(link => {
            const socialLink = document.createElement('a');
            socialLink.href = link.url;
            socialLink.target = '_blank';
            socialLink.rel = 'noopener noreferrer';
            socialLink.className = 'social-pill';
            socialLink.title = link.title;
            
            const icon = getSocialIcon(link.type);
            if (icon) {
                socialLink.innerHTML = icon;
                pillRow.appendChild(socialLink);
            }
        });
    }
}

function getSocialIcon(type) {
    const icons = {
        Discord: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.354-.403.7-." fill="currentColor"/></svg>`,
        YouTube: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg>`,
        Github: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C7.402 18.51 6.136 17.9 6.136 17.9c-1.1-.753.084-.738.084-.738 1.21.085 1.85 1.243 1.85 1.243 1.07 1.833 2.809 1.303 3.495.998.108-.776.417-1.303.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.125-.3-.535-1.524.115-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.65 1.652.24 2.876.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.82 1.102.82 2.225 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.63-5.37-12-12-12" fill="currentColor"/></svg>`,
    };
    return icons[type] || null;
}