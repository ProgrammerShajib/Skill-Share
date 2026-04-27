function renderDashboardTable(userName) {
    let skills = JSON.parse(localStorage.getItem('allSkills')) || []; 
    let userSkills = skills.filter(s => s.provider === userName); 
    let html = '';
    if (userSkills.length === 0) { 
        html = `<tr><td colspan="4" class="text-center py-4 text-muted">No skills yet.</td></tr>`; 
    } else { 
        userSkills.forEach(skill => { 
            let badges = ''; 
            if(skill.videoUrl) badges += '<span class="badge bg-danger bg-opacity-10 text-danger me-1">Video</span>'; 
            if(skill.fileUrl) badges += '<span class="badge bg-success bg-opacity-10 text-success me-1">File</span>'; 
            if(!badges) badges = '<span class="text-muted small">None</span>'; 
            html += `<tr><td class="ps-4 fw-semibold">${skill.title}</td><td><span class="badge rounded-pill" style="background: rgba(212, 83, 10, 0.1); color: #D4530A;">${skill.category}</span></td><td>${badges}</td><td class="text-center pe-4"><button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteSkill(${skill.id})"><i class="bi bi-trash3 me-1"></i>Remove</button></td></tr>`; 
        }); 
    }
    $('#crud-table-body').html(html);
}

function deleteSkill(id) {
    if (confirm("Delete this skill?")) { 
        let skills = JSON.parse(localStorage.getItem('allSkills')) || []; 
        skills = skills.filter(s => s.id !== id); 
        localStorage.setItem('allSkills', JSON.stringify(skills)); 
        let currentUser = JSON.parse(localStorage.getItem('currentUser')); 
        renderDashboardTable(currentUser.name); 
    }
}

// NEW: RENDER MESSAGES RECEIVED BY THIS INSTRUCTOR
function renderMessagesTable(instructorName) {
    let messages = JSON.parse(localStorage.getItem('allMessages')) || [];
    // Filter messages sent TO this specific user
    let myMessages = messages.filter(m => m.toInstructor === instructorName);
    
    let html = '';
    if (myMessages.length === 0) { 
        html = `<tr><td colspan="4" class="text-center py-4 text-muted">No messages received yet.</td></tr>`; 
    } else { 
        // Sort by newest first
        myMessages.reverse().forEach(msg => { 
            let formattedDate = new Date(msg.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            html += `
            <tr>
                <td class="ps-4">
                    <div class="fw-semibold">${msg.fromStudent}</div>
                    <div class="text-muted small">Re: ${msg.skillTitle}</div>
                </td>
                <td style="max-width: 300px;">${msg.message}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td class="text-center pe-4">
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteMessage(${msg.id})"><i class="bi bi-trash3"></i></button>
                </td>
            </tr>`; 
        }); 
    }
    $('#messages-table-body').html(html);
}

function deleteMessage(id) {
    if (confirm("Delete this message?")) { 
        let messages = JSON.parse(localStorage.getItem('allMessages')) || []; 
        messages = messages.filter(m => m.id !== id); 
        localStorage.setItem('allMessages', JSON.stringify(messages)); 
        let currentUser = JSON.parse(localStorage.getItem('currentUser')); 
        renderMessagesTable(currentUser.name); 
    }
}