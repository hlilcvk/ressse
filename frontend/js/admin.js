const API_URL = '/api';
let uzmanlarArray = [];

// Auth check
const token = localStorage.getItem('auth_token');
const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

if (!token || !userData.is_super_admin) {
    window.location.href = '/login.html';
}

document.getElementById('userName').textContent = userData.ad_soyad || userData.kullanici_adi;

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// API helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    if (response.status === 401 || response.status === 403) {
        alert('Oturum süreniz doldu');
        logout();
        return;
    }

    return response.json();
}

// İşletmeleri yükle
async function loadIsletmeler() {
    const data = await apiRequest('/admin/isletmeler');
    const tbody = document.getElementById('isletmelerTable');
    
    if (data.success && data.data.length > 0) {
        tbody.innerHTML = data.data.map(i => `
            <tr>
                <td><strong>${i.isletme_id}</strong></td>
                <td>${i.kullanici_adi}</td>
                <td>${i.ad_soyad}</td>
                <td><code>${i.bagli_tablo_adi}</code></td>
                <td><span class="badge bg-info">${i.uzman_sayisi || 0} uzman</span></td>
                <td>${new Date(i.created_at).toLocaleDateString('tr-TR')}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteIsletme(${i.id}, '${i.ad_soyad}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Henüz işletme eklenmemiş</td></tr>';
    }
}

// Modal aç
function openAddModal() {
    uzmanlarArray = [];
    document.getElementById('addForm').reset();
    document.getElementById('uzmanlarList').innerHTML = '';
    new bootstrap.Modal(document.getElementById('addModal')).show();
}

// Uzman ekle
function addUzman() {
    const input = document.getElementById('uzmanInput');
    const uzman = input.value.trim();
    
    if (!uzman) {
        alert('Uzman adı boş olamaz');
        return;
    }
    
    if (uzmanlarArray.includes(uzman)) {
        alert('Bu uzman zaten ekli');
        return;
    }
    
    uzmanlarArray.push(uzman);
    updateUzmanlarList();
    input.value = '';
}

// Uzman listesini güncelle
function updateUzmanlarList() {
    const list = document.getElementById('uzmanlarList');
    list.innerHTML = uzmanlarArray.map((u, i) => `
        <span class="badge bg-primary">
            ${u}
            <i class="bi bi-x-circle ms-1" style="cursor:pointer;" onclick="removeUzman(${i})"></i>
        </span>
    `).join('');
}

// Uzman çıkar
function removeUzman(index) {
    uzmanlarArray.splice(index, 1);
    updateUzmanlarList();
}

// Form submit
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (uzmanlarArray.length === 0) {
        alert('En az 1 uzman eklemelisiniz');
        return;
    }

    const formData = {
        isletme_id: document.getElementById('isletmeId').value.trim(),
        kullanici_adi: document.getElementById('kullaniciAdi').value.trim(),
        ad_soyad: document.getElementById('adSoyad').value.trim(),
        sifre: document.getElementById('sifre').value,
        bagli_tablo_adi: document.getElementById('tabloAdi').value.trim(),
        uzmanlar: uzmanlarArray
    };

    // Validasyon
    if (formData.sifre.length < 6) {
        alert('Şifre en az 6 karakter olmalı');
        return;
    }

    if (!/^[a-z0-9_]+$/.test(formData.bagli_tablo_adi)) {
        alert('Tablo adı sadece küçük harf, rakam ve alt çizgi içerebilir');
        return;
    }

    const result = await apiRequest('/admin/isletme', {
        method: 'POST',
        body: JSON.stringify(formData)
    });

    if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
        loadIsletmeler();
        alert('İşletme başarıyla oluşturuldu!');
    } else {
        alert('Hata: ' + result.message);
    }
});

// İşletme sil
async function deleteIsletme(id, name) {
    if (!confirm(`"${name}" işletmesini silmek istediğinizden emin misiniz?\n\nTüm randevu verileri silinecektir!`)) {
        return;
    }

    const result = await apiRequest(`/admin/isletme/${id}`, {
        method: 'DELETE'
    });

    if (result.success) {
        loadIsletmeler();
        alert('İşletme silindi');
    } else {
        alert('Hata: ' + result.message);
    }
}

// Sayfa yüklendiğinde
loadIsletmeler();
