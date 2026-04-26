function renderAdminNoticeTable() {
    let notices = JSON.parse(localStorage.getItem('allNotices')) || [];
    let html = '';
    if (notices.length === 0) { 
        html = `<tr><td colspan="3" class="text-center py-4 text-muted">No notices created yet.</td></tr>`; 
    } else {
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

function renderAdminUserTable() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let html = '';
    if (users.length === 0) {
        html = `<tr><td colspan="3" class="text-center py-4 text-muted">No users registered yet.</td></tr>`;
    } else {
        users.forEach(user => {
            let actionBtn = user.email === 'admin@skillshare.com' 
                ? '<span class="badge bg-success"><i class="bi bi-shield-check me-1"></i>Protected Admin</span>' 
                : `<button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteUserAccount('${user.email}')"><i class="bi bi-person-x me-1"></i>Delete</button>`;
            
            html += `<tr><td class="ps-4 fw-semibold">${user.name}</td><td class="text-muted">${user.email}</td><td class="text-center pe-4">${actionBtn}</td></tr>`;
        });
    }
    $('#admin-user-table-body').html(html);
}

function deleteUserAccount(email) {
    if (confirm("Are you sure? This will permanently delete this user AND all skills they have posted!")) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let userToDelete = users.find(u => u.email === email);
        
        if (userToDelete) {
            let updatedUsers = users.filter(u => u.email !== email);
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            let skills = JSON.parse(localStorage.getItem('allSkills')) || [];
            let updatedSkills = skills.filter(s => s.provider !== userToDelete.name);
            localStorage.setItem('allSkills', JSON.stringify(updatedSkills));

            renderAdminUserTable();
            alert("User and their skills deleted successfully.");
        }
    }
}