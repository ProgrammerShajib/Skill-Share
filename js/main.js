$(document).ready(function() {
    // 1. Load Navbar and Footer dynamically
    $("#navbar-container").load("components/navbar.html", function() {
        checkAuthStatus(); // Update navbar buttons after it loads
    });
    $("#footer-container").load("components/footer.html");

    // 2. Initialize Data: Fetch JSON if local storage is empty
    if (!localStorage.getItem('allSkills')) {
        $.ajax({
            url: 'data/skills.json',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                localStorage.setItem('allSkills', JSON.stringify(data));
                if(window.location.pathname.includes('skills.html')) {
                    renderPublicSkills();
                }
            }
        });
    } else {
        // If data already exists in storage, just render it
        if(window.location.pathname.includes('skills.html')) {
            renderPublicSkills();
        }
    }

    // 3. Register User Logic
    $('#registerForm').submit(function(e) {
        e.preventDefault();
        let name = $('#regName').val();
        let email = $('#regEmail').val();
        let password = $('#regPassword').val();
        
        let users = JSON.parse(localStorage.getItem('users')) || [];
        // Simple check if user exists
        if(users.some(u => u.email === email)) {
            alert("Email already registered!");
            return;
        }
        
        users.push({ name: name, email: email, password: password });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Registration Successful! Please login.");
        window.location.href = 'login.html';
    });

    // 4. Login User Logic
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        let email = $('#loginEmail').val();
        let password = $('#loginPassword').val();
        
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let user = users.find(u => u.email === email && u.password === password);
        
        if(user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert("Login Successful!");
            window.location.href = 'dashboard.html';
        } else {
            alert("Invalid email or password.");
        }
    });

    // 5. Dashboard Logic (Protected Route)
    if(window.location.pathname.includes('dashboard.html')) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Kick out unauthenticated users
        if(!currentUser) {
            alert("You must sign up or log in to add skills.");
            window.location.href = 'login.html';
            return; // Stop executing script
        }

        $('#welcome-msg').text(`Welcome, ${currentUser.name}!`);
        renderDashboardTable(currentUser.name);

        // Add New Skill (Create)
        $('#crudForm').submit(function(e) {
            e.preventDefault();
            let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
            let newSkill = {
                id: Date.now(),
                title: $('#skillTitle').val(),
                category: $('#skillCat').val(),
                description: $('#skillDesc').val(),
                provider: currentUser.name // Automatically assign logged-in user
            };
            
            skills.push(newSkill);
            localStorage.setItem('allSkills', JSON.stringify(skills)); // Save to global skills
            this.reset();
            renderDashboardTable(currentUser.name);
            $('#crudModal').modal('hide');
            alert("Skill added! Everyone can now see it on the Browse Skills page.");
        });
    }
});

// --- HELPER FUNCTIONS ---

// Update Navbar based on Login state
function checkAuthStatus() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser) {
        $('.auth-guest').hide();
        $('.auth-logged-in').show();
    } else {
        $('.auth-guest').show();
        $('.auth-logged-in').hide();
    }

    // Logout functionality
    $('#logoutBtn').click(function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        alert("Logged out successfully.");
        window.location.href = 'index.html';
    });
}

// Render skills on the public skills.html page
function renderPublicSkills() {
    let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
    let html = '';
    skills.forEach(skill => {
        html += `
        <div class="col-md-4 mb-4">
            <div class="card skill-card h-100 shadow-sm border-0">
                <div class="card-body">
                    <span class="badge bg-primary mb-2">${skill.category}</span>
                    <h5 class="card-title fw-bold">${skill.title}</h5>
                    <h6 class="card-subtitle mb-3 text-muted">Instructor: ${skill.provider}</h6>
                    <p class="card-text text-secondary">${skill.description}</p>
                    <button class="btn btn-sm btn-outline-primary w-100 mt-auto">Request Class</button>
                </div>
            </div>
        </div>`;
    });
    $('#skills-list').html(html);
}

// Render skills specific to the logged-in user on Dashboard
function renderDashboardTable(userName) {
    let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
    // Filter to only show skills created by this user
    let userSkills = skills.filter(s => s.provider === userName); 
    
    let html = '';
    userSkills.forEach(skill => {
        html += `
        <tr>
            <td>${skill.title}</td>
            <td>${skill.category}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSkill(${skill.id})">Remove</button>
            </td>
        </tr>`;
    });
    if(userSkills.length === 0) {
        html = '<tr><td colspan="3" class="text-center">You haven\'t added any skills yet.</td></tr>';
    }
    $('#crud-table-body').html(html);
}

// Delete Skill
function deleteSkill(id) {
    if(confirm("Are you sure you want to delete this skill?")) {
        let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
        skills = skills.filter(s => s.id !== id);
        localStorage.setItem('allSkills', JSON.stringify(skills));
        
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        renderDashboardTable(currentUser.name);
    }
}