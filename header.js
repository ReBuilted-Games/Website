document.addEventListener('DOMContentLoaded', () => {
    const groupId = 223811537; // Your group ID
    const iconApiUrl = `https://thumbnails.roproxy.com/v1/groups/icons?groupIds=${groupId}&size=150x150&format=Png&isCircular=false`;

    const groupIconElement = document.getElementById('group-icon');

    // Only fetch if the icon element exists on the page
    if (groupIconElement) {
        fetch(iconApiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Icon API response failed.');
                return response.json();
            })
            .then(iconData => {
                if (iconData.data && iconData.data.length > 0) {
                    groupIconElement.src = iconData.data[0].imageUrl;
                }
            })
            .catch(error => console.error('Error fetching group icon:', error));
    }
});