// Global variable for profile picture compression
let compressedBase64Image = "";

// Convert YouTube URL to embeddable format
function getYouTubeEmbed(url) {
    if (!url) return '';
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    if (match && match[2].length == 11) return 'https://www.youtube.com/embed/' + match[2];
    return '';
}

// Compress image before saving to LocalStorage
function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) { 
            const img = new Image(); 
            img.onload = function() { 
                const canvas = document.createElement('canvas'); 
                const MAX_SIZE = 300; 
                let width = img.width, height = img.height; 
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } } 
                canvas.width = width; canvas.height = height; 
                const ctx = canvas.getContext('2d'); 
                ctx.drawImage(img, 0, 0, width, height); 
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            }; 
            img.src = event.target.result; 
        };
        reader.readAsDataURL(file);
    });
}