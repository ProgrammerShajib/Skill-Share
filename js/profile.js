function initProfilePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileName = urlParams.get('name');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let targetUser = null;
    
    if (!profileName && currentUser) { targetUser = currentUser; } 
    else if (profileName) { 
        let users = JSON.parse(localStorage.getItem('users')) || []; 
        targetUser = users.find(u => u.name.toLowerCase() === profileName.toLowerCase()); 
        if (!targetUser) targetUser = { name: profileName, photo: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "" }; 
    } else { alert("Please log in."); window.location.href = 'login.html'; return; }
    
    document.title = `${targetUser.name} | SkillShare`; 
    $('#profile-name').text(targetUser.name); 
    $('#profile-pic').attr('src', targetUser.photo); 
    $('#profile-bio').text(targetUser.bio || "No bio available yet.");
    
    if (currentUser && currentUser.email === targetUser.email) { 
        $('#edit-profile-btn').removeClass('d-none'); 
        $('#editBio').val(targetUser.bio); 
        compressedBase64Image = targetUser.photo; 
        
        $('#uploadBtn').click(function() { $('#imageUpload').trigger('click'); }); 
        $('#imageUpload').change(async function(e) { 
            const file = e.target.files[0]; 
            if (file) { 
                compressedBase64Image = await compressImage(file); 
                $('#imagePreview').attr('src', compressedBase64Image).removeClass('d-none'); 
                $('#uploadBtn').html('<i class="bi bi-check-circle me-2 text-success"></i> Image Selected!'); 
            } 
        }); 
    }
    
    renderProfileSkills(targetUser.name);
    
    $('#editProfileForm').submit(function (e) { 
        e.preventDefault(); 
        let newBio = $('#editBio').val(); 
        let users = JSON.parse(localStorage.getItem('users')) || []; 
        let userIndex = users.findIndex(u => u.email === currentUser.email); 
        if (userIndex !== -1) { 
            users[userIndex].photo = compressedBase64Image; 
            users[userIndex].bio = newBio; 
            localStorage.setItem('users', JSON.stringify(users)); 
            currentUser.photo = compressedBase64Image; 
            currentUser.bio = newBio; 
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); 
            $('#profile-pic').attr('src', compressedBase64Image); 
            $('#profile-bio').text(newBio); 
            $('#editProfileModal').modal('hide'); 
            alert("Profile updated!"); 
        } 
    });
}

function renderProfileSkills(userName) {
    let skills = JSON.parse(localStorage.getItem('allSkills')) || []; 
    let userSkills = skills.filter(s => s.provider === userName); 
    if (userSkills.length === 0) { $('#no-skills-msg').removeClass('d-none'); $('#profile-skills-list').html(''); return; } 
    $('#no-skills-msg').addClass('d-none'); 
    let html = '';
    userSkills.forEach(skill => { 
        let imageUrl = skill.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"; 
        let resourceBadges = ''; 
        if(skill.videoUrl) resourceBadges += '<span class="badge bg-danger me-1"><i class="bi bi-play-circle"></i> Video</span>'; 
        if(skill.fileUrl) resourceBadges += '<span class="badge bg-success me-1"><i class="bi bi-file-earmark-arrow-down"></i> File</span>'; 
        html += `<div class="col-md-6 col-lg-4 mb-4"><a href="skill-details.html?id=${skill.id}" class="skill-card-box text-decoration-none"><img src="${imageUrl}" class="skill-img" alt="${skill.title}"><div class="skill-details"><div class="d-flex justify-content-between align-items-center mb-2"><span class="badge rounded-pill" style="background: #D4530A; color: white; padding: 0.4rem 0.8rem; font-size: 0.75rem;">${skill.category}</span>${resourceBadges}</div><h5 class="fw-bold mb-1" style="color: #2D2420;">${skill.title}</h5><p class="text-muted small mt-auto mb-3">${skill.description.substring(0, 60)}...</p><div class="mt-auto"><span class="view-btn w-100 text-center d-block">View Details</span></div></div></a></div>`; 
    });
    $('#profile-skills-list').html(html);
}