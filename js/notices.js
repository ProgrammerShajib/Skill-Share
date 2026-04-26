function renderNotices(notices) {
    let html = '';
    notices.forEach(notice => {
        let formattedDate = new Date(notice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        html += `<div class="card card-premium mb-3 border-0 shadow-sm"><div class="card-body p-4"><div class="d-flex justify-content-between align-items-start mb-2"><h5 class="fw-bold mb-0" style="color: #2D2420;">${notice.title}</h5><span class="badge rounded-pill ms-3" style="background: #FAF5EF; color: #5D4E42; white-space: nowrap;"><i class="bi bi-calendar3 me-1"></i>${formattedDate}</span></div><p class="text-muted mb-0">${notice.content}</p></div></div>`;
    });
    if (html === '') { 
        $('#xml-data-container').html('<div class="text-center text-muted py-5"><i class="bi bi-megaphone fs-1"></i><p class="mt-2">No notices at this time.</p></div>'); 
    } else { 
        $('#xml-data-container').html(html); 
    }
}