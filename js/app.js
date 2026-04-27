console.log("VERSION 7.1 - MESSAGING SYSTEM ADDED!");

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
        
        // Render Skills Table
        renderDashboardTable(currentUser.name);

        // NEW: Render Messages Table
        renderMessagesTable(currentUser.name);

        // Handle Skill Submission Form
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

    // 7. NOTICES PAGE LOGIC
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