const API_URL = '/api';
let calendar;
let currentAppointmentId = null;
let uzmanlar = [];

// Auth check
const token = localStorage.getItem('auth_token');
const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

if (!token) {
    window.location.href = '/login.html';
}

if (userData.is_super_admin) {
    window.location.href = '/admin.html';
}

document.getElementById('userName').textContent = userData.ad_soyad || userData.kullanici_adi;

// Logout
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

// Uzmanları yükle
async function loadUzmanlar() {
    const data = await apiRequest('/appointments/uzmanlar');
    if (data.success) {
        uzmanlar = data.data;
        const select = document.getElementById('uzman');
        select.innerHTML = '<option value="">Seçiniz...</option>';
        uzmanlar.forEach(u => {
            select.innerHTML += `<option value="${u.oda_adi}">${u.oda_adi}</option>`;
        });
    }
}

// Calendar başlat
document.addEventListener('DOMContentLoaded', async function() {
    await loadUzmanlar();

    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'tr',
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        slotDuration: '00:30:00',
        allDaySlot: false,
        height: 'auto',
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        
        // Takvim tıklama - yeni randevu
        select: function(info) {
            openModal(null, info.start, info.end);
        },

        // Randevu tıklama - düzenle
        eventClick: function(info) {
            const event = info.event;
            openModal(event);
        },

        // Randevu sürükle
        eventDrop: async function(info) {
            const event = info.event;
            await updateAppointment(event.id, {
                musteri_adi: event.title.split(' - ')[0],
                telefon_no: event.extendedProps.telefon_no,
                islem_turu: event.extendedProps.islem_turu,
                uzman: event.extendedProps.uzman,
                baslangic_saati: event.start.toISOString(),
                bitis_saati: event.end.toISOString(),
                notlar: event.extendedProps.notlar
            });
        },

        // Randevu resize
        eventResize: async function(info) {
            const event = info.event;
            await updateAppointment(event.id, {
                musteri_adi: event.title.split(' - ')[0],
                telefon_no: event.extendedProps.telefon_no,
                islem_turu: event.extendedProps.islem_turu,
                uzman: event.extendedProps.uzman,
                baslangic_saati: event.start.toISOString(),
                bitis_saati: event.end.toISOString(),
                notlar: event.extendedProps.notlar
            });
        },

        events: async function(info, successCallback, failureCallback) {
            const data = await apiRequest(`/appointments?start=${info.startStr}&end=${info.endStr}`);
            if (data.success) {
                const events = data.data.map(apt => ({
                    id: apt.id,
                    title: `${apt.musteri_adi} - ${apt.uzman}`,
                    start: apt.baslangic_saati,
                    end: apt.bitis_saati,
                    color: getColorForUzman(apt.uzman),
                    extendedProps: apt
                }));
                successCallback(events);
            } else {
                failureCallback();
            }
        }
    });

    calendar.render();
});

// Uzman renkleri
function getColorForUzman(uzman) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const index = uzmanlar.findIndex(u => u.oda_adi === uzman);
    return colors[index % colors.length] || '#667eea';
}

// Modal aç
function openModal(event = null, start = null, end = null) {
    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    const form = document.getElementById('appointmentForm');
    
    form.reset();
    currentAppointmentId = null;
    document.getElementById('deleteBtn').style.display = 'none';

    if (event) {
        // Düzenleme modu
        document.getElementById('modalTitle').textContent = 'Randevu Düzenle';
        document.getElementById('deleteBtn').style.display = 'block';
        currentAppointmentId = event.id;
        
        const props = event.extendedProps;
        document.getElementById('appointmentId').value = event.id;
        document.getElementById('musteriAdi').value = props.musteri_adi;
        document.getElementById('telefonNo').value = props.telefon_no || '';
        document.getElementById('islemTuru').value = props.islem_turu || '';
        document.getElementById('uzman').value = props.uzman;
        document.getElementById('baslangicSaati').value = formatDateTimeLocal(event.start);
        document.getElementById('bitisSaati').value = formatDateTimeLocal(event.end);
        document.getElementById('notlar').value = props.notlar || '';
    } else {
        // Yeni randevu
        document.getElementById('modalTitle').textContent = 'Yeni Randevu';
        if (start && end) {
            document.getElementById('baslangicSaati').value = formatDateTimeLocal(start);
            document.getElementById('bitisSaati').value = formatDateTimeLocal(end);
        }
    }

    modal.show();
}

// DateTime format
function formatDateTimeLocal(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

// Form submit
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        musteri_adi: document.getElementById('musteriAdi').value,
        telefon_no: document.getElementById('telefonNo').value,
        islem_turu: document.getElementById('islemTuru').value,
        uzman: document.getElementById('uzman').value,
        baslangic_saati: new Date(document.getElementById('baslangicSaati').value).toISOString(),
        bitis_saati: new Date(document.getElementById('bitisSaati').value).toISOString(),
        notlar: document.getElementById('notlar').value
    };

    let result;
    if (currentAppointmentId) {
        result = await updateAppointment(currentAppointmentId, formData);
    } else {
        result = await apiRequest('/appointments', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
        calendar.refetchEvents();
        alert(result.message);
    } else {
        alert('Hata: ' + result.message);
    }
});

// Update
async function updateAppointment(id, data) {
    return await apiRequest(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// Delete
document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!currentAppointmentId) return;
    
    if (confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
        const result = await apiRequest(`/appointments/${currentAppointmentId}`, {
            method: 'DELETE'
        });

        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
            calendar.refetchEvents();
            alert('Randevu silindi');
        } else {
            alert('Hata: ' + result.message);
        }
    }
});
