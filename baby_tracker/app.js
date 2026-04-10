// Application State
let records = JSON.parse(localStorage.getItem('babyTrackerRecords')) || [];
let editMode = false;
let currentEditId = null;
let feedingChartInstance = null;
let diaperChartInstance = null;

// DOM Elements
const feedForm = document.getElementById('feed-form');
const diaperForm = document.getElementById('diaper-form');
const formsSection = document.getElementById('forms-section');
const historySection = document.getElementById('history-section');
const trendsSection = document.getElementById('trends-section');
const tabBtns = document.querySelectorAll('.tab-btn');
const historyList = document.getElementById('history-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDateTimes();
    renderHistory();
});

// --- Tab Navigation ---
window.switchTab = function(tabName) {
    // Reset tabs
    tabBtns.forEach(btn => btn.classList.remove('active'));
    formsSection.style.display = 'none';
    feedForm.style.display = 'none';
    diaperForm.style.display = 'none';
    historySection.style.display = 'none';
    trendsSection.style.display = 'none';

    // Activate selected tab
    if (tabName === 'feed') {
        formsSection.style.display = 'block';
        feedForm.style.display = 'block';
        tabBtns[0].classList.add('active');
        setDefaultDateTimes();
    } else if (tabName === 'diaper') {
        formsSection.style.display = 'block';
        diaperForm.style.display = 'block';
        tabBtns[1].classList.add('active');
        setDefaultDateTimes();
    } else if (tabName === 'history') {
        historySection.style.display = 'block';
        tabBtns[2].classList.add('active');
        renderHistory();
    } else if (tabName === 'trends') {
        trendsSection.style.display = 'block';
        tabBtns[3].classList.add('active');
        renderCharts();
    }
};

// --- Form Logic ---
window.toggleFeedFields = function() {
    const type = document.getElementById('feed-type').value;
    const bottleFields = document.getElementById('bottle-fields');
    const breastFields = document.getElementById('breast-fields');

    if (type === 'bottle') {
        bottleFields.style.display = 'block';
        breastFields.style.display = 'none';
        document.getElementById('feed-amount').required = true;
        document.getElementById('feed-duration').required = false;
    } else {
        bottleFields.style.display = 'none';
        breastFields.style.display = 'block';
        document.getElementById('feed-amount').required = false;
        document.getElementById('feed-duration').required = true;
    }
};

function setDefaultDateTimes() {
    const now = new Date();
    // Format to YYYY-MM-DDThh:mm for datetime-local
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const formatted = now.toISOString().slice(0, 16);

    if(!editMode) {
        document.getElementById('feed-date').value = formatted;
        document.getElementById('diaper-date').value = formatted;
    }
}

// --- Data Handling ---
function saveRecord(record) {
    if (editMode) {
        const index = records.findIndex(r => r.id === currentEditId);
        if (index !== -1) {
            records[index] = record;
        }
        cancelEdit(record.category);
    } else {
        records.push(record);
    }

    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('babyTrackerRecords', JSON.stringify(records));

    alert('Record saved!');

    if (record.category === 'feed') {
        feedForm.reset();
        toggleFeedFields(); // Reset field visibility
        setDefaultDateTimes();
    } else {
        diaperForm.reset();
        setDefaultDateTimes();
    }
}

feedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('feed-type').value;
    const record = {
        id: editMode ? currentEditId : Date.now().toString(),
        category: 'feed',
        date: document.getElementById('feed-date').value,
        type: type,
        amount: type === 'bottle' ? parseFloat(document.getElementById('feed-amount').value) : null,
        side: type === 'breast' ? document.getElementById('feed-side').value : null,
        duration: type === 'breast' ? parseInt(document.getElementById('feed-duration').value) : null
    };
    saveRecord(record);
});

diaperForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const record = {
        id: editMode ? currentEditId : Date.now().toString(),
        category: 'diaper',
        date: document.getElementById('diaper-date').value,
        type: document.getElementById('diaper-type').value
    };
    saveRecord(record);
});

// --- History & Editing ---
window.renderHistory = function() {
    const filter = document.getElementById('history-filter').value;
    historyList.innerHTML = '';

    const filteredRecords = records.filter(r => filter === 'all' || r.category === filter);

    if (filteredRecords.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No records found.</div>';
        return;
    }

    filteredRecords.forEach(record => {
        const dateObj = new Date(record.date);
        const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        let title = '';
        let details = '';
        let emoji = '';

        if (record.category === 'feed') {
            emoji = '🍼';
            title = record.type === 'bottle' ? 'Bottle Feeding' : 'Breast Feeding';
            if (record.type === 'bottle') {
                details = `${record.amount} oz`;
            } else {
                details = `${record.side} side, ${record.duration} mins`;
            }
        } else if (record.category === 'diaper') {
            emoji = '🧷';
            if (record.type === 'wet') { title = 'Wet Diaper (Pee)'; details = '💧'; }
            if (record.type === 'dirty') { title = 'Dirty Diaper (Poop)'; details = '💩'; }
            if (record.type === 'both') { title = 'Mixed Diaper'; details = '💧💩'; }
        }

        const item = document.createElement('div');
        item.className = `history-item ${record.category}`;
        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-title">${emoji} ${title}</div>
                <div class="history-item-details">${dateStr} • ${details}</div>
            </div>
            <div class="history-item-actions">
                <button class="btn-edit" onclick="editRecord('${record.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteRecord('${record.id}')">Delete</button>
            </div>
        `;
        historyList.appendChild(item);
    });
};

window.deleteRecord = function(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        records = records.filter(r => r.id !== id);
        localStorage.setItem('babyTrackerRecords', JSON.stringify(records));
        renderHistory();
        // If we delete while on trends tab, re-render charts
        if (trendsSection.style.display === 'block') {
            renderCharts();
        }
    }
};

window.editRecord = function(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;

    editMode = true;
    currentEditId = id;

    if (record.category === 'feed') {
        switchTab('feed');
        document.getElementById('feed-date').value = record.date;
        document.getElementById('feed-type').value = record.type;
        toggleFeedFields();

        if (record.type === 'bottle') {
            document.getElementById('feed-amount').value = record.amount;
        } else {
            document.getElementById('feed-side').value = record.side;
            document.getElementById('feed-duration').value = record.duration;
        }

        document.getElementById('feed-submit-btn').textContent = 'Update Feeding';
        document.querySelector('#feed-form .btn-cancel').style.display = 'block';

    } else if (record.category === 'diaper') {
        switchTab('diaper');
        document.getElementById('diaper-date').value = record.date;
        document.getElementById('diaper-type').value = record.type;

        document.getElementById('diaper-submit-btn').textContent = 'Update Diaper';
        document.querySelector('#diaper-form .btn-cancel').style.display = 'block';
    }
};

window.cancelEdit = function(category) {
    editMode = false;
    currentEditId = null;

    if (category === 'feed') {
        feedForm.reset();
        document.getElementById('feed-submit-btn').textContent = 'Save Feeding';
        document.querySelector('#feed-form .btn-cancel').style.display = 'none';
        toggleFeedFields();
    } else if (category === 'diaper') {
        diaperForm.reset();
        document.getElementById('diaper-submit-btn').textContent = 'Save Diaper';
        document.querySelector('#diaper-form .btn-cancel').style.display = 'none';
    }
    setDefaultDateTimes();
};

// --- Charts Logic ---
window.renderCharts = function() {
    if (!window.Chart) {
        console.error("Chart.js not loaded.");
        return;
    }

    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7Days.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }

    // Initialize chart data structures
    const feedAmounts = Array(7).fill(0);
    const feedDurations = Array(7).fill(0);
    const peeCounts = Array(7).fill(0);
    const poopCounts = Array(7).fill(0);

    // Populate data
    records.forEach(record => {
        const recDate = new Date(record.date);
        const recDateString = recDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const dayIndex = last7Days.indexOf(recDateString);

        if (dayIndex !== -1) {
            if (record.category === 'feed') {
                if (record.type === 'bottle' && record.amount) {
                    feedAmounts[dayIndex] += parseFloat(record.amount);
                } else if (record.type === 'breast' && record.duration) {
                    feedDurations[dayIndex] += parseInt(record.duration);
                }
            } else if (record.category === 'diaper') {
                if (record.type === 'wet' || record.type === 'both') {
                    peeCounts[dayIndex]++;
                }
                if (record.type === 'dirty' || record.type === 'both') {
                    poopCounts[dayIndex]++;
                }
            }
        }
    });

    // Destroy old charts to prevent overlap/glitches
    if (feedingChartInstance) feedingChartInstance.destroy();
    if (diaperChartInstance) diaperChartInstance.destroy();

    // Render Feeding Chart
    const ctxFeed = document.getElementById('feedingChart').getContext('2d');
    feedingChartInstance = new Chart(ctxFeed, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [
                {
                    label: 'Bottle (oz)',
                    data: feedAmounts,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Breast (mins)',
                    data: feedDurations,
                    type: 'line',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Feeding Totals' }
            },
            scales: {
                y: { type: 'linear', display: true, position: 'left', title: {display: true, text: 'Ounces'} },
                y1: { type: 'linear', display: true, position: 'right', title: {display: true, text: 'Minutes'}, grid: {drawOnChartArea: false} }
            }
        }
    });

    // Render Diaper Chart
    const ctxDiaper = document.getElementById('diaperChart').getContext('2d');
    diaperChartInstance = new Chart(ctxDiaper, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [
                {
                    label: 'Wet (Pee)',
                    data: peeCounts,
                    backgroundColor: 'rgba(241, 196, 15, 0.6)', // Yellow
                    borderColor: 'rgba(241, 196, 15, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Dirty (Poop)',
                    data: poopCounts,
                    backgroundColor: 'rgba(139, 69, 19, 0.6)', // Brown
                    borderColor: 'rgba(139, 69, 19, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Diaper Changes' }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true, title: {display: true, text: 'Count'} }
            }
        }
    });
};