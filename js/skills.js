function setupFilters() {
    $('#searchInput').on('input', renderPublicSkills);
    $('#categoryFilter').on('change', renderPublicSkills);
}

function renderPublicSkills() {
    let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
    let searchQuery = $('#searchInput').val().toLowerCase();
    let selectedCat = $('#categoryFilter').val();
    let filteredSkills = skills.filter(skill => {
        let matchSearch = skill.title.toLowerCase().includes(searchQuery) || skill.provider.toLowerCase().includes(searchQuery);
        let matchCat = selectedCat === 'all' || skill.category === selectedCat;
        return matchSearch && matchCat;
    });
    let html = '';
    if (filteredSkills.length === 0) { $('#no-results').removeClass('d-none'); } else { $('#no-results').addClass('d-none'); }
    filteredSkills.forEach(skill => {
        let imageUrl = skill.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80";
        let resourceBadges = '';
        if(skill.videoUrl) resourceBadges += '<span class="badge bg-danger me-1"><i class="bi bi-play-circle"></i> Video</span>';
        if(skill.fileUrl) resourceBadges += '<span class="badge bg-success me-1"><i class="bi bi-file-earmark-arrow-down"></i> File</span>';
        html += `<div class="col-lg-4 col-md-6 mb-4"><a href="skill-details.html?id=${skill.id}" class="skill-card-box text-decoration-none"><img src="${imageUrl}" class="skill-img" alt="${skill.title}"><div class="skill-details"><div class="d-flex justify-content-between align-items-center mb-2"><span class="badge rounded-pill" style="background: #D4530A; color: white; padding: 0.4rem 0.8rem; font-size: 0.75rem;">${skill.category}</span>${resourceBadges}</div><h5 class="fw-bold mb-1" style="color: #2D2420;">${skill.title}</h5><h6 class="text-muted small mb-2"><i class="bi bi-person-fill me-1"></i> ${skill.provider}</h6><p class="text-muted small mb-3">${skill.description.substring(0, 80)}...</p><div class="mt-auto"><span class="view-btn w-100 text-center d-block">View Details</span></div></div></a></div>`;
    });
    $('#skills-list').html(html);
}

function loadSkillDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const skillId = parseInt(urlParams.get('id'));
    let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
    let skill = skills.find(s => s.id === skillId);
    
    if (!skill) { $('.container').html('<div class="text-center mt-5"><h3>Skill not found.</h3><a href="skills.html" class="btn btn-premium mt-3">Back to Skills</a></div>'); return; }
    
    document.title = skill.title + ' | SkillShare';
    $('#breadcrumb-title').text(skill.title); 
    $('#detail-image').attr('src', skill.image); 
    $('#detail-category').text(skill.category); 
    $('#detail-title').text(skill.title); 
    $('#detail-description').text(skill.description);
    $('#detail-provider').html(`<a href="profile.html?name=${encodeURIComponent(skill.provider)}" class="profile-link-hover text-decoration-none">${skill.provider}</a>`);
    
    // Put skill name inside the modal
    $('#modal-skill-name').text(skill.title);

    // --- MESSAGE BUTTON LOGIC ---
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let $msgBtn = $('#sendMessageBtn');

    // Disable if NOT logged in
    if (!currentUser) {
        $msgBtn.html('Login to Message').addClass('btn-secondary').removeClass('btn-premium');
        $msgBtn.off('click').on('click', function(e) {
            e.preventDefault();
            alert("Please log in first to send a message.");
            window.location.href = 'login.html';
        });
    } 
    // Disable if it's YOUR OWN skill
    else if (currentUser.name === skill.provider) {
        $msgBtn.html('Your Skill').prop('disabled', true).addClass('btn-secondary').removeClass('btn-premium');
    } 
    // Enable for normal users
    else {
        $msgBtn.html('<i class="bi bi-chat-dots me-1"></i> Send Message').removeClass('btn-secondary').addClass('btn-premium');
    }

    // --- VIDEO & FILE LOGIC ---
    if (skill.videoUrl && skill.videoUrl.trim() !== "") { 
        let embedUrl = getYouTubeEmbed(skill.videoUrl); 
        if (embedUrl) { $('#detail-video').attr('src', embedUrl); $('#video-container').removeClass('d-none'); } 
        else { $('#video-container').addClass('d-none'); } 
    } else { $('#video-container').addClass('d-none'); }

    if (skill.fileUrl && skill.fileUrl.trim() !== "") { 
        $('#detail-file').attr('href', skill.fileUrl); $('#file-container').removeClass('d-none'); 
    } else { $('#file-container').addClass('d-none'); }
}

// --- HANDLE MESSAGE FORM SUBMISSION ---
 $(document).ready(function() {
    $('#messageForm').submit(function(e) {
        e.preventDefault();
        
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        const urlParams = new URLSearchParams(window.location.search);
        const skillId = parseInt(urlParams.get('id'));
        let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
        let skill = skills.find(s => s.id === skillId);

        // Create Message object
        let newMessage = {
            id: Date.now(),
            skillId: skillId,
            skillTitle: skill.title,
            toInstructor: skill.provider, // Key piece of data!
            fromStudent: currentUser.name,
            fromEmail: currentUser.email,
            message: $('#messageText').val(),
            date: new Date().toISOString() // Save as ISO string for easy sorting
        };

        // Save to LocalStorage
        let messages = JSON.parse(localStorage.getItem('allMessages')) || [];
        messages.push(newMessage);
        localStorage.setItem('allMessages', JSON.stringify(messages));

        // Reset and close
        this.reset();
        $('#messageModal').modal('hide');
        alert("Message sent successfully to " + skill.provider + "!");
    });
});