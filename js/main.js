console.log("VERSION 6.1 - ADMIN USER MANAGEMENT ADDED!");

function getYouTubeEmbed(url) {
    if (!url) return '';
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    if (match && match[2].length == 11) return 'https://www.youtube.com/embed/' + match[2];
    return '';
}

 $(document).ready(function () {
    // 1. LOAD NAVBAR & FOOTER
    $("#navbar-container").load("components/navbar.html", function () {
        checkAuthStatus();
    });
    $("#footer-container").load("components/footer.html");

    // 2. LOAD SKILLS DATA
    $.ajax({
        url: 'data/skills.json', method: 'GET', dataType: 'json',
        success: function (jsonData) {
            let existingSkills = JSON.parse(localStorage.getItem('allSkills')) || [];
            jsonData.forEach(skill => {
                let index = existingSkills.findIndex(s => s.id === skill.id);
                if (index !== -1) { existingSkills[index] = skill; } 
                else { existingSkills.push(skill); }
            });
            localStorage.setItem('allSkills', JSON.stringify(existingSkills));
            if (window.location.pathname.includes('skills.html')) { renderPublicSkills(); setupFilters(); }
            if (window.location.pathname.includes('skill-details.html')) { loadSkillDetails(); }
        },
        error: function () {
            if (window.location.pathname.includes('skills.html')) { renderPublicSkills(); setupFilters(); }
            if (window.location.pathname.includes('skill-details.html')) { loadSkillDetails(); }
        }
    });

    // 3. REGISTER USER
    $('#registerForm').submit(function (e) {
        e.preventDefault();
        let name = $('#regName').val(), email = $('#regEmail').val(), password = $('#regPassword').val();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) { alert("Email already registered!"); return; }
        users.push({ name, email, password, photo: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "" });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Registration successful!"); window.location.href = 'login.html';
    });

    // 4. LOGIN USER
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        let email = $('#loginEmail').val(), password = $('#loginPassword').val();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // AUTO-CREATE ADMIN IF IT DOESN'T EXIST
        if (email === 'admin@skillshare.com' && !users.some(u => u.email === email)) {
            users.push({ name: "System Admin", email: "admin@skillshare.com", password: password, photo: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "Platform Administrator" });
            localStorage.setItem('users', JSON.stringify(users));
        }

        let user = users.find(u => u.email === email && u.password === password);
        if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); alert("Login successful!"); window.location.href = 'dashboard.html'; } 
        else { alert("Invalid email or password."); }
    });

    // 5. DASHBOARD LOGIC
    if (window.location.pathname.includes('dashboard.html')) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) { alert("You must log in first."); window.location.href = 'login.html'; return; }
        $('#welcome-msg').text(`Welcome, ${currentUser.name}!`);
        renderDashboardTable(currentUser.name);

        $('#crudForm').submit(function (e) {
            e.preventDefault();
            let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
            let selectedCategory = $('#skillCat').val();
            let newImage = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80";
            if (selectedCategory === "Programming") newImage = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80";
            if (selectedCategory === "Design") newImage = "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80";
            if (selectedCategory === "Languages") newImage = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80";
            if (selectedCategory === "Academics") newImage = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80";
            skills.push({ id: Date.now(), title: $('#skillTitle').val(), category: selectedCategory, description: $('#skillDesc').val(), provider: currentUser.name, image: newImage, videoUrl: $('#skillVideo').val() || "", fileUrl: $('#skillFile').val() || "" });
            localStorage.setItem('allSkills', JSON.stringify(skills));
            this.reset(); renderDashboardTable(currentUser.name); $('#crudModal').modal('hide'); alert("Skill added!");
        });
    }

    // 6. PROFILE PAGE LOGIC
    if (window.location.pathname.includes('profile.html')) {
        initProfilePage();
    }

    // 7. NOTICES PAGE LOGIC (DYNAMIC)
    if (window.location.pathname.includes('notices.html')) {
        let notices = JSON.parse(localStorage.getItem('allNotices'));
        if (!notices) {
            $.ajax({
                url: 'data/notices.xml', dataType: 'xml',
                success: function(xml) {
                    let tempNotices = [];
                    $(xml).find('notice').each(function() {
                        tempNotices.push({ title: $(this).find('title').text(), date: $(this).find('date').text(), content: $(this).find('content').text() });
                    });
                    localStorage.setItem('allNotices', JSON.stringify(tempNotices));
                    renderNotices(tempNotices);
                },
                error: function() { renderNotices([]); }
            });
        } else {
            renderNotices(notices);
        }
    }

    // 8. ADMIN PANEL LOGIC
    if (window.location.pathname.includes('admin.html')) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.email !== 'admin@skillshare.com') {
            alert("Access Denied. Admins only."); window.location.href = 'index.html'; return;
        }
        
        // Load both tables on admin page load
        renderAdminNoticeTable();
        renderAdminUserTable();

        $('#adminNoticeForm').submit(function (e) {
            e.preventDefault();
            let notices = JSON.parse(localStorage.getItem('allNotices')) || [];
            notices.unshift({ title: $('#noticeTitle').val(), date: $('#noticeDate').val(), content: $('#noticeContent').val() });
            localStorage.setItem('allNotices', JSON.stringify(notices));
            this.reset(); renderAdminNoticeTable(); alert("Notice Published Successfully!");
        });
    }
});

// NAVBAR AUTH CHECK
function checkAuthStatus() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) { 
        $('.auth-guest').hide(); 
        $('.auth-logged-in').show(); 
        if (currentUser.email === 'admin@skillshare.com') { $('.admin-only').show(); } else { $('.admin-only').hide(); }
    } else { 
        $('.auth-guest').show(); 
        $('.auth-logged-in').hide(); 
        $('.admin-only').hide();
    }
    $('#logoutBtn').click(function (e) { e.preventDefault(); localStorage.removeItem('currentUser'); alert("Logged out."); window.location.href = 'index.html'; });
}

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
    $('#breadcrumb-title').text(skill.title); $('#detail-image').attr('src', skill.image); $('#detail-category').text(skill.category); $('#detail-title').text(skill.title); $('#detail-description').text(skill.description);
    $('#detail-provider').html(`<a href="profile.html?name=${encodeURIComponent(skill.provider)}" class="profile-link-hover text-decoration-none">${skill.provider}</a>`);
    if (skill.videoUrl && skill.videoUrl.trim() !== "") { let embedUrl = getYouTubeEmbed(skill.videoUrl); if (embedUrl) { $('#detail-video').attr('src', embedUrl); $('#video-container').removeClass('d-none'); } else { $('#video-container').addClass('d-none'); } } else { $('#video-container').addClass('d-none'); }
    if (skill.fileUrl && skill.fileUrl.trim() !== "") { $('#detail-file').attr('href', skill.fileUrl); $('#file-container').removeClass('d-none'); } else { $('#file-container').addClass('d-none'); }
}

function renderNotices(notices) {
    let html = '';
    notices.forEach(notice => {
        let formattedDate = new Date(notice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        html += `<div class="card card-premium mb-3 border-0 shadow-sm"><div class="card-body p-4"><div class="d-flex justify-content-between align-items-start mb-2"><h5 class="fw-bold mb-0" style="color: #2D2420;">${notice.title}</h5><span class="badge rounded-pill ms-3" style="background: #FAF5EF; color: #5D4E42; white-space: nowrap;"><i class="bi bi-calendar3 me-1"></i>${formattedDate}</span></div><p class="text-muted mb-0">${notice.content}</p></div></div>`;
    });
    if (html === '') { $('#xml-data-container').html('<div class="text-center text-muted py-5"><i class="bi bi-megaphone fs-1"></i><p class="mt-2">No notices at this time.</p></div>'); } else { $('#xml-data-container').html(html); }
}

function renderAdminNoticeTable() {
    let notices = JSON.parse(localStorage.getItem('allNotices')) || [];
    let html = '';
    if (notices.length === 0) { html = `<tr><td colspan="3" class="text-center py-4 text-muted">No notices created yet.</td></tr>`; } else {
        notices.forEach((notice, index) => {
            let formattedDate = new Date(notice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            html += `<tr><td class="ps-4 fw-semibold">${notice.title}</td><td class="text-muted">${formattedDate}</td><td class="text-center pe-4"><button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteNotice(${index})"><i class="bi bi-trash3 me-1"></i>Delete</button></td></tr>`;
        });
    }
    $('#admin-notice-table-body').html(html);
}

function deleteNotice(index) {
    if (confirm("Delete this notice?")) {
        let notices = JSON.parse(localStorage.getItem('allNotices')) || [];
        notices.splice(index, 1);
        localStorage.setItem('allNotices', JSON.stringify(notices));
        renderAdminNoticeTable();
    }
}

// NEW: RENDER ADMIN USER TABLE
function renderAdminUserTable() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let html = '';
    if (users.length === 0) {
        html = `<tr><td colspan="3" class="text-center py-4 text-muted">No users registered yet.</td></tr>`;
    } else {
        users.forEach(user => {
            // Protect the admin account from being deleted
            let actionBtn = user.email === 'admin@skillshare.com' 
                ? '<span class="badge bg-success"><i class="bi bi-shield-check me-1"></i>Protected Admin</span>' 
                : `<button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteUserAccount('${user.email}')"><i class="bi bi-person-x me-1"></i>Delete</button>`;
            
            html += `<tr><td class="ps-4 fw-semibold">${user.name}</td><td class="text-muted">${user.email}</td><td class="text-center pe-4">${actionBtn}</td></tr>`;
        });
    }
    $('#admin-user-table-body').html(html);
}

// NEW: DELETE USER ACCOUNT & THEIR SKILLS
function deleteUserAccount(email) {
    if (confirm("Are you sure? This will permanently delete this user AND all skills they have posted!")) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find the user to get their name (so we can delete their skills)
        let userToDelete = users.find(u => u.email === email);
        
        if (userToDelete) {
            // 1. Remove user from users array
            let updatedUsers = users.filter(u => u.email !== email);
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            // 2. Remove all skills posted by this user
            let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
            let updatedSkills = skills.filter(s => s.provider !== userToDelete.name);
            localStorage.setItem('allSkills', JSON.stringify(updatedSkills));

            // Refresh the admin table to show the user is gone
            renderAdminUserTable();
            alert("User and their skills deleted successfully.");
        }
    }
}

let compressedBase64Image = "";
function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) { const img = new Image(); img.onload = function() { const canvas = document.createElement('canvas'); const MAX_SIZE = 300; let width = img.width, height = img.height; if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', 0.7)); }; img.src = event.target.result; };
        reader.readAsDataURL(file);
    });
}

function initProfilePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileName = urlParams.get('name');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let targetUser = null;
    if (!profileName && currentUser) { targetUser = currentUser; } else if (profileName) { let users = JSON.parse(localStorage.getItem('users')) || []; targetUser = users.find(u => u.name.toLowerCase() === profileName.toLowerCase()); if (!targetUser) targetUser = { name: profileName, photo: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "" }; } else { alert("Please log in."); window.location.href = 'login.html'; return; }
    document.title = `${targetUser.name} | SkillShare`; $('#profile-name').text(targetUser.name); $('#profile-pic').attr('src', targetUser.photo); $('#profile-bio').text(targetUser.bio || "No bio available yet.");
    if (currentUser && currentUser.email === targetUser.email) { $('#edit-profile-btn').removeClass('d-none'); $('#editBio').val(targetUser.bio); compressedBase64Image = targetUser.photo; $('#uploadBtn').click(function() { $('#imageUpload').trigger('click'); }); $('#imageUpload').change(async function(e) { const file = e.target.files[0]; if (file) { compressedBase64Image = await compressImage(file); $('#imagePreview').attr('src', compressedBase64Image).removeClass('d-none'); $('#uploadBtn').html('<i class="bi bi-check-circle me-2 text-success"></i> Image Selected!'); } }); }
    renderProfileSkills(targetUser.name);
    $('#editProfileForm').submit(function (e) { e.preventDefault(); let newBio = $('#editBio').val(); let users = JSON.parse(localStorage.getItem('users')) || []; let userIndex = users.findIndex(u => u.email === currentUser.email); if (userIndex !== -1) { users[userIndex].photo = compressedBase64Image; users[userIndex].bio = newBio; localStorage.setItem('users', JSON.stringify(users)); currentUser.photo = compressedBase64Image; currentUser.bio = newBio; localStorage.setItem('currentUser', JSON.stringify(currentUser)); $('#profile-pic').attr('src', compressedBase64Image); $('#profile-bio').text(newBio); $('#editProfileModal').modal('hide'); alert("Profile updated!"); } });
}

function renderProfileSkills(userName) {
    let skills = JSON.parse(localStorage.getItem('allSkills')) || []; let userSkills = skills.filter(s => s.provider === userName); if (userSkills.length === 0) { $('#no-skills-msg').removeClass('d-none'); $('#profile-skills-list').html(''); return; } $('#no-skills-msg').addClass('d-none'); let html = '';
    userSkills.forEach(skill => { let imageUrl = skill.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"; let resourceBadges = ''; if(skill.videoUrl) resourceBadges += '<span class="badge bg-danger me-1"><i class="bi bi-play-circle"></i> Video</span>'; if(skill.fileUrl) resourceBadges += '<span class="badge bg-success me-1"><i class="bi bi-file-earmark-arrow-down"></i> File</span>'; html += `<div class="col-md-6 col-lg-4 mb-4"><a href="skill-details.html?id=${skill.id}" class="skill-card-box text-decoration-none"><img src="${imageUrl}" class="skill-img" alt="${skill.title}"><div class="skill-details"><div class="d-flex justify-content-between align-items-center mb-2"><span class="badge rounded-pill" style="background: #D4530A; color: white; padding: 0.4rem 0.8rem; font-size: 0.75rem;">${skill.category}</span>${resourceBadges}</div><h5 class="fw-bold mb-1" style="color: #2D2420;">${skill.title}</h5><p class="text-muted small mt-auto mb-3">${skill.description.substring(0, 60)}...</p><div class="mt-auto"><span class="view-btn w-100 text-center d-block">View Details</span></div></div></a></div>`; });
    $('#profile-skills-list').html(html);
}

function renderDashboardTable(userName) {
    let skills = JSON.parse(localStorage.getItem('allSkills')) || []; let userSkills = skills.filter(s => s.provider === userName); let html = '';
    if (userSkills.length === 0) { html = `<tr><td colspan="4" class="text-center py-4 text-muted">No skills yet.</td></tr>`; } else { userSkills.forEach(skill => { let badges = ''; if(skill.videoUrl) badges += '<span class="badge bg-danger bg-opacity-10 text-danger me-1">Video</span>'; if(skill.fileUrl) badges += '<span class="badge bg-success bg-opacity-10 text-success me-1">File</span>'; if(!badges) badges = '<span class="text-muted small">None</span>'; html += `<tr><td class="ps-4 fw-semibold">${skill.title}</td><td><span class="badge rounded-pill" style="background: rgba(212, 83, 10, 0.1); color: #D4530A;">${skill.category}</span></td><td>${badges}</td><td class="text-center pe-4"><button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteSkill(${skill.id})"><i class="bi bi-trash3 me-1"></i>Remove</button></td></tr>`; }); }
    $('#crud-table-body').html(html);
}

function deleteSkill(id) {
    if (confirm("Delete this skill?")) { let skills = JSON.parse(localStorage.getItem('allSkills')) || []; skills = skills.filter(s => s.id !== id); localStorage.setItem('allSkills', JSON.stringify(skills)); let currentUser = JSON.parse(localStorage.getItem('currentUser')); renderDashboardTable(currentUser.name); }
}