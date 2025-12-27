// Frontend Environment Configuration
// Nginx proxy kullanıyoruz - backend aynı domain'de /api altında

window.ENV_CONFIG = {
    // Nginx proxy üzerinden backend'e erişim
    API_BASE_URL: '/api',
    
    // Geliştirme ortamı kontrolü
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
};

// Localhost'ta direkt backend portuna bağlan
if (window.ENV_CONFIG.IS_DEVELOPMENT) {
    window.ENV_CONFIG.API_BASE_URL = 'http://localhost:3000/api';
}
