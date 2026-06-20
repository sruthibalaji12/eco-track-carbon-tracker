
// Application State
const state = {
    logs: [],
    completedChallenges: [],
    xp: 0,
    level: 1,
    profileName: "Eco Warrior"
};

// Fixed list of challenges
const CHALLENGES = [
    { id: 'c1', title: 'Meatless Day', desc: 'Swap meat-based meals for plant-based ones for a full day.', xp: 25, category: 'food' },
    { id: 'c2', title: 'Active Commuter', desc: 'Walk, cycle, or run to your destination instead of driving.', xp: 35, category: 'transport' },
    { id: 'c3', title: 'Power Down Hour', desc: 'Turn off all non-essential lights and devices for 2 hours.', xp: 20, category: 'energy' },
    { id: 'c4', title: 'Zero-Waste Champion', desc: 'Generate zero landfill waste (recycle/compost everything) for a day.', xp: 30, category: 'waste' },
    { id: 'c5', title: 'Public Transport Star', desc: 'Use bus, train, or subway for your commute.', xp: 25, category: 'transport' },
    { id: 'c6', title: 'Cold Wash Cycle', desc: 'Wash a load of laundry using cold water instead of hot.', xp: 15, category: 'energy' }
];

// Tree Instance
let ecoTree = null;

// DOM Elements
const elements = {
    navItems: document.querySelectorAll('.nav-item, .mobile-nav-item'),
    pageViews: document.querySelectorAll('.page-view'),
    headerTitle: document.getElementById('headerTitle'),
    headerSubtitle: document.getElementById('headerSubtitle'),
    
    // Dashboard values
    valDailyFootprint: document.getElementById('valDailyFootprint'),
    valEcoLevel: document.getElementById('valEcoLevel'),
    valEcoXp: document.getElementById('valEcoXp'),
    valCarbonSaved: document.getElementById('valCarbonSaved'),
    dashboardRecommendation: document.getElementById('dashboardRecommendation'),
    customLegend: document.getElementById('customLegend'),

    // Modal elements
    btnOpenLog: document.getElementById('btnOpenLog'),
    logModal: document.getElementById('logModal'),
    btnCloseLogModal: document.getElementById('btnCloseLogModal'),
    btnCancelLogModal: document.getElementById('btnCancelLogModal'),
    modalTabs: document.querySelectorAll('.modal-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    activityForm: document.getElementById('activityForm'),
    logDate: document.getElementById('logDate'),
    
    // Tracker elements
    historyList: document.getElementById('historyList'),
    btnClearLogs: document.getElementById('btnClearLogs'),
    
    // Action / suggestions elements
    suggestionsGrid: document.getElementById('suggestionsGrid'),
    challengeList: document.getElementById('challengeList'),
    
    // Garden elements
    gardenLevelName: document.getElementById('gardenLevelName'),
    gardenXpText: document.getElementById('gardenXpText'),
    gardenProgressBar: document.getElementById('gardenProgressBar'),
    treesPlantedVal: document.getElementById('treesPlantedVal'),
    
    // Profile
    profileName: document.getElementById('profileName'),
    profileLevel: document.getElementById('profileLevel'),
    avatarLetter: document.getElementById('avatarLetter')
};

// Standard daily average baseline footprint in kg per person (for savings computation)
const BASELINE_DAILY_FOOTPRINT = 15.0;

/**
 * Seed historical data for visualization if localstorage is empty.
 */
function seedInitialData() {
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const sampleLogs = [
        // 5 days ago
        { id: 'l1', date: formatDate(new Date(today - 5 * dayMs)), category: 'transport', details: 'Petrol Car (30 km)', co2: calculateTransport('petrol_car', 30) },
        { id: 'l2', date: formatDate(new Date(today - 5 * dayMs)), category: 'food', details: 'Meat-heavy meal choice', co2: calculateFood('meat_heavy') },
        
        // 4 days ago
        { id: 'l3', date: formatDate(new Date(today - 4 * dayMs)), category: 'transport', details: 'Public Transport (20 km)', co2: calculateTransport('public_transit', 20) },
        { id: 'l4', date: formatDate(new Date(today - 4 * dayMs)), category: 'energy', details: 'Electricity (12 kWh) & Gas (6 kWh)', co2: calculateEnergy(12, 6, 0.4) },
        { id: 'l5', date: formatDate(new Date(today - 4 * dayMs)), category: 'food', details: 'Vegetarian meal choice', co2: calculateFood('vegetarian') },

        // 3 days ago
        { id: 'l6', date: formatDate(new Date(today - 3 * dayMs)), category: 'transport', details: 'Active Travel (10 km Walk)', co2: calculateTransport('active', 10) },
        { id: 'l7', date: formatDate(new Date(today - 3 * dayMs)), category: 'food', details: 'Vegan meal choice', co2: calculateFood('vegan') },
        { id: 'l8', date: formatDate(new Date(today - 3 * dayMs)), category: 'waste', details: 'Waste (3.0 kg, 75% recycled)', co2: calculateWaste(3.0, 75) },

        // 2 days ago
        { id: 'l9', date: formatDate(new Date(today - 2 * dayMs)), category: 'transport', details: 'Electric Car (40 km)', co2: calculateTransport('electric_car', 40) },
        { id: 'l10', date: formatDate(new Date(today - 2 * dayMs)), category: 'energy', details: 'Electricity (10 kWh)', co2: calculateEnergy(10, 0, 0.2) },
        { id: 'l11', date: formatDate(new Date(today - 2 * dayMs)), category: 'food', details: 'Balanced meal choice', co2: calculateFood('balanced') },

        // Yesterday
        { id: 'l12', date: formatDate(new Date(today - 1 * dayMs)), category: 'transport', details: 'Active Travel (5 km Cycle)', co2: calculateTransport('active', 5) },
        { id: 'l13', date: formatDate(new Date(today - 1 * dayMs)), category: 'food', details: 'Vegetarian meal choice', co2: calculateFood('vegetarian') },
        { id: 'l14', date: formatDate(new Date(today - 1 * dayMs)), category: 'waste', details: 'Waste (1.5 kg, 50% recycled)', co2: calculateWaste(1.5, 50) }
    ];

    state.logs = sampleLogs;
    state.completedChallenges = ['c1', 'c3']; // Seed some completed challenges
    state.xp = 180; // Seed XP
    state.level = 2; // Level 2
    saveState();
}

/**
 * Format Date to YYYY-MM-DD
 */
function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Save state to localStorage.
 */
function saveState() {
    localStorage.setItem('ecotrack_state', JSON.stringify(state));
}

/**
 * Load state from localStorage.
 */
function loadState() {
    const data = localStorage.getItem('ecotrack_state');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            Object.assign(state, parsed);
        } catch (e) {
            console.error("Error parsing stored state, seeding new data", e);
            seedInitialData();
        }
    } else {
        seedInitialData();
    }
    // Update level derived property
    state.level = 1 + Math.floor(state.xp / 100);
}

/**
 * Routing & Page Navigation
 */
function initRouter() {
    function route() {
        const hash = window.location.hash.slice(1) || 'overview';
        let targetView = document.getElementById(hash);
        
        if (!targetView) {
            targetView = document.getElementById('overview');
        }

        // Deactivate all views and links
        elements.pageViews.forEach(view => view.classList.remove('active'));
        elements.navItems.forEach(item => item.classList.remove('active'));

        // Activate matching view and navigation indicators
        targetView.classList.add('active');
        
        const matchingNavs = document.querySelectorAll(`[data-target="${hash}"]`);
        matchingNavs.forEach(nav => nav.classList.add('active'));

        // Update headers dynamically
        const titles = {
            overview: { main: "Dashboard", sub: "Monitor your daily carbon footprint in real-time." },
            tracker: { main: "Tracker & Logs", sub: "View log history and benchmark your carbon savings." },
            suggestions: { main: "Eco-Actions", sub: "Reduce emissions with personalized actions and daily challenges." },
            garden: { main: "Virtual Garden", sub: "Watch your eco garden thrive as you build green habits." }
        };

        const pageTitleText = titles[hash] || titles.overview;
        elements.headerTitle.textContent = pageTitleText.main;
        elements.headerSubtitle.textContent = pageTitleText.sub;

        // Perform view-specific redraws
        if (hash === 'garden' && ecoTree) {
            ecoTree.resize();
            ecoTree.update(state.xp, state.level);
            ecoTree.start();
        } else if (ecoTree) {
            ecoTree.stop();
        }

        if (hash === 'overview') {
            renderDashboardCharts();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('hashchange', route);
    route(); // Trigger initial routing
}

/**
 * Modal Dialog Handlers
 */
function initModal() {
    elements.btnOpenLog.addEventListener('click', () => {
        elements.logDate.value = formatDate(new Date());
        elements.activityForm.reset();
        switchTab('tab-transport');
        elements.logModal.classList.add('active');
    });

    const closeModal = () => elements.logModal.classList.remove('active');
    elements.btnCloseLogModal.addEventListener('click', closeModal);
    elements.btnCancelLogModal.addEventListener('click', closeModal);
    
    // Close modal if clicking overlay
    elements.logModal.addEventListener('click', (e) => {
        if (e.target === elements.logModal) closeModal();
    });

    // Tab switcher inside modal
    elements.modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabId) {
    elements.modalTabs.forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
    });
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

/**
 * Handles Logging form submissions.
 */
function handleLogSubmission(e) {
    e.preventDefault();
    
    const activeTab = document.querySelector('.modal-tab.active').getAttribute('data-tab');
    const dateVal = elements.logDate.value;
    const logId = 'log_' + Date.now();
    let category = '';
    let details = '';
    let co2 = 0;

    if (activeTab === 'tab-transport') {
        category = 'transport';
        const mode = document.getElementById('transportMode').value;
        const dist = parseFloat(document.getElementById('transportDistance').value) || 0;
        
        co2 = calculateTransport(mode, dist);
        const modeNames = {
            petrol_car: 'Petrol Car',
            diesel_car: 'Diesel Car',
            electric_car: 'Electric Car',
            public_transit: 'Public Transport',
            active: 'Active Travel (Walk/Cycle)'
        };
        details = `${modeNames[mode]} (${dist} km)`;
    } else if (activeTab === 'tab-energy') {
        category = 'energy';
        const elec = parseFloat(document.getElementById('energyElectricity').value) || 0;
        const gas = parseFloat(document.getElementById('energyGas').value) || 0;
        const water = parseFloat(document.getElementById('energyWater').value) || 0;
        
        co2 = calculateEnergy(elec, gas, water);
        details = `Electricity (${elec} kWh) + Gas (${gas} kWh) + Water (${water} m³)`;
    } else if (activeTab === 'tab-food') {
        category = 'food';
        const diet = document.getElementById('foodDiet').value;
        
        co2 = calculateFood(diet);
        const dietNames = {
            meat_heavy: 'Meat-heavy meal choice',
            balanced: 'Balanced meal choice',
            vegetarian: 'Vegetarian meal choice',
            vegan: 'Vegan meal choice'
        };
        details = dietNames[diet];
    } else if (activeTab === 'tab-waste') {
        category = 'waste';
        const weight = parseFloat(document.getElementById('wasteWeight').value) || 0;
        const rec = parseFloat(document.getElementById('wasteRecycling').value) || 0;
        
        co2 = calculateWaste(weight, rec);
        details = `Waste generated (${weight} kg, ${rec}% recycled)`;
    }

    // Add to state logs
    state.logs.push({
        id: logId,
        date: dateVal,
        category,
        details,
        co2
    });

    // Award XP for logging (10 XP per unique daily logging card)
    awardXP(10);
    
    saveState();
    elements.logModal.classList.remove('active');
    
    // Refresh panels
    renderAll();
}

/**
 * Award XP points and handle leveling up.
 */
function awardXP(amount) {
    const prevLevel = state.level;
    state.xp += amount;
    state.level = 1 + Math.floor(state.xp / 100);
    
    if (state.level > prevLevel) {
        // Play small level up prompt or animation if desired
        console.log(`Leveled Up to Level ${state.level}!`);
    }
}

/**
 * Format level title descriptions.
 */
function getLevelName(lvl) {
    const titles = ["Sapling", "Seedling", "Sprout", "Green Guard", "Eco Warrior", "Earth Guardian"];
    const idx = Math.min(titles.length - 1, lvl - 1);
    return `Level ${lvl} ${titles[idx]}`;
}

/**
 * Rendering core view states.
 */
function renderAll() {
    renderProfileWidget();
    renderStatsWidgets();
    renderHistoryList();
    renderSuggestions();
    renderChallenges();
    renderDashboardCharts();
    renderGardenStats();
}

function renderProfileWidget() {
    elements.profileName.textContent = state.profileName;
    elements.profileLevel.textContent = getLevelName(state.level);
    elements.avatarLetter.textContent = state.profileName.charAt(0);
}

function renderStatsWidgets() {
    // 1. Daily Footprint (Logged today)
    const todayStr = formatDate(new Date());
    const todayLogs = state.logs.filter(log => log.date === todayStr);
    const todaySum = todayLogs.reduce((sum, item) => sum + item.co2, 0);
    elements.valDailyFootprint.textContent = todaySum.toFixed(1);

    // 2. Level and XP text
    elements.valEcoLevel.textContent = `Lvl ${state.level}`;
    const nextXpBase = state.level * 100;
    const currentXpBase = (state.level - 1) * 100;
    const progressXp = state.xp - currentXpBase;
    elements.valEcoXp.textContent = `${progressXp} / 100 XP to next level`;

    // 3. Carbon Saved (baseline vs logged)
    // Find unique days logged in logs history
    const uniqueDays = [...new Set(state.logs.map(log => log.date))];
    const numDays = Math.max(1, uniqueDays.length);
    const totalEmissions = state.logs.reduce((sum, log) => sum + log.co2, 0);
    const baselineTotal = numDays * BASELINE_DAILY_FOOTPRINT;
    const carbonSaved = Math.max(0, baselineTotal - totalEmissions);
    elements.valCarbonSaved.textContent = carbonSaved.toFixed(1);
}

function renderHistoryList() {
    elements.historyList.innerHTML = '';
    
    // Sort logs descending by date
    const sortedLogs = [...state.logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedLogs.length === 0) {
        elements.historyList.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                <p>No activity logged yet. Click "Log Activity" to start tracking!</p>
            </div>
        `;
        return;
    }

    const icons = {
        transport: 'fa-car',
        energy: 'fa-bolt',
        food: 'fa-utensils',
        waste: 'fa-trash'
    };

    sortedLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="item-left">
                <div class="item-icon badge-${log.category}">
                    <i class="fa-solid ${icons[log.category]}"></i>
                </div>
                <div class="item-info">
                    <span class="item-title">${log.details}</span>
                    <span class="item-date">${log.date}</span>
                </div>
            </div>
            <div class="item-right">
                <span class="item-value text-${log.category}">${log.co2.toFixed(1)} kg CO2e</span>
                <button class="btn-delete-log" data-id="${log.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        // Add delete listener
        item.querySelector('.btn-delete-log').addEventListener('click', () => {
            state.logs = state.logs.filter(l => l.id !== log.id);
            saveState();
            renderAll();
        });

        elements.historyList.appendChild(item);
    });
}

function renderSuggestions() {
    // Group logs by category to find average daily distribution
    const categoryTotals = { transport: 0, energy: 0, food: 0, waste: 0 };
    state.logs.forEach(log => {
        if (categoryTotals[log.category] !== undefined) {
            categoryTotals[log.category] += log.co2;
        }
    });

    const uniqueDays = [...new Set(state.logs.map(log => log.date))];
    const numDays = Math.max(1, uniqueDays.length);
    
    const categoryAverages = {
        transport: categoryTotals.transport / numDays,
        energy: categoryTotals.energy / numDays,
        food: categoryTotals.food / numDays,
        waste: categoryTotals.waste / numDays
    };

    // Get suggestion list using utility formulas
    const suggestions = getSuggestions(categoryAverages);
    
    // Render dynamic Dashboard High-impact suggestion
    const topSuggestion = suggestions[0];
    if (topSuggestion) {
        elements.dashboardRecommendation.innerHTML = `
            <div class="action-header">
                <span class="action-title">${topSuggestion.title}</span>
                <span class="action-points" style="background: rgba(6,182,212,0.1); color: var(--secondary); border-color: rgba(6,182,212,0.2);">Impact: ${topSuggestion.impact}</span>
            </div>
            <p class="action-desc">${topSuggestion.desc}</p>
            <div class="action-footer">
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent);">Action: ${topSuggestion.action}</span>
                <a href="#suggestions" class="btn btn-secondary btn-sm" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">View Actions</a>
            </div>
        `;
    }

    // Render actions grid in Eco-Actions view
    elements.suggestionsGrid.innerHTML = '';
    suggestions.forEach(s => {
        const icons = { transport: 'fa-car', energy: 'fa-bolt', food: 'fa-utensils', waste: 'fa-trash' };
        const card = document.createElement('div');
        card.className = 'action-card';
        card.innerHTML = `
            <div>
                <div class="action-header">
                    <span class="action-title" style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid ${icons[s.category]} text-${s.category}"></i>
                        ${s.title}
                    </span>
                    <span class="action-points">Impact: ${s.impact}</span>
                </div>
                <p class="action-desc">${s.desc}</p>
            </div>
            <div class="action-footer" style="margin-top: 1rem;">
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">Tip: ${s.action}</span>
            </div>
        `;
        elements.suggestionsGrid.appendChild(card);
    });
}

function renderChallenges() {
    elements.challengeList.innerHTML = '';
    
    CHALLENGES.forEach(c => {
        const isCompleted = state.completedChallenges.includes(c.id);
        const item = document.createElement('div');
        item.className = `challenge-item ${isCompleted ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div class="challenge-left">
                <div class="checkbox-custom"></div>
                <div class="challenge-info">
                    <span class="challenge-title" style="font-weight: 600; font-size: 0.95rem;">${c.title}</span>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">${c.desc}</p>
                </div>
            </div>
            <div>
                <span class="action-points">+${c.xp} XP</span>
            </div>
        `;

        item.addEventListener('click', () => {
            toggleChallenge(c.id, c.xp);
        });

        elements.challengeList.appendChild(item);
    });
}

function toggleChallenge(id, xpVal) {
    const idx = state.completedChallenges.indexOf(id);
    if (idx > -1) {
        // Uncompleted
        state.completedChallenges.splice(idx, 1);
        state.xp = Math.max(0, state.xp - xpVal);
    } else {
        // Completed
        state.completedChallenges.push(id);
        awardXP(xpVal);
    }
    
    state.level = 1 + Math.floor(state.xp / 100);
    saveState();
    renderAll();
    
    if (ecoTree) {
        ecoTree.update(state.xp, state.level);
        ecoTree.draw();
    }
}

function renderGardenStats() {
    elements.gardenLevelName.textContent = getLevelName(state.level);
    
    const nextXpBase = state.level * 100;
    const currentXpBase = (state.level - 1) * 100;
    const progressXp = state.xp - currentXpBase;
    
    elements.gardenXpText.textContent = `${progressXp} / 100 XP`;
    elements.gardenProgressBar.style.width = `${progressXp}%`;
    
    // Trees planted equivalent calculations:
    // A fully grown tree absorbs roughly 22kg of CO2 per year, which is ~0.06kg per day.
    // If savings = total carbon saved, we can count: Saved / 22
    const totalEmissions = state.logs.reduce((sum, log) => sum + log.co2, 0);
    const uniqueDays = [...new Set(state.logs.map(log => log.date))];
    const numDays = Math.max(1, uniqueDays.length);
    const carbonSaved = Math.max(0, (numDays * BASELINE_DAILY_FOOTPRINT) - totalEmissions);
    
    const treesEquivalent = carbonSaved / 22.0;
    elements.treesPlantedVal.textContent = `${treesEquivalent.toFixed(2)} Trees`;
}

function renderDashboardCharts() {
    // 1. Category Chart calculations
    const totals = { transport: 0, energy: 0, food: 0, waste: 0 };
    state.logs.forEach(log => {
        if (totals[log.category] !== undefined) {
            totals[log.category] += log.co2;
        }
    });

    const categoryCanvas = document.getElementById('categoryChart');
    updateCategoryChart(categoryCanvas, totals);

    // Render HTML legend matching colors
    const sum = totals.transport + totals.energy + totals.food + totals.waste;
    const getPercent = (val) => sum === 0 ? 0 : Math.round((val / sum) * 100);
    
    elements.customLegend.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.8rem; font-weight: 500;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: ${COLORS.transport};"></span>
                <span style="color: var(--text-secondary);">Transport:</span>
                <span style="margin-left: auto; font-weight: 700; color: #fff;">${getPercent(totals.transport)}%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: ${COLORS.energy};"></span>
                <span style="color: var(--text-secondary);">Energy:</span>
                <span style="margin-left: auto; font-weight: 700; color: #fff;">${getPercent(totals.energy)}%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: ${COLORS.food};"></span>
                <span style="color: var(--text-secondary);">Food:</span>
                <span style="margin-left: auto; font-weight: 700; color: #fff;">${getPercent(totals.food)}%</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: ${COLORS.waste};"></span>
                <span style="color: var(--text-secondary);">Waste:</span>
                <span style="margin-left: auto; font-weight: 700; color: #fff;">${getPercent(totals.waste)}%</span>
            </div>
        </div>
    `;

    // 2. Trend Chart calculations
    // Generate dates for the past 7 days
    const last7Days = [];
    const dayMs = 24 * 60 * 60 * 1000;
    const today = new Date();
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today - i * dayMs);
        const dateStr = formatDate(d);
        const dayLogs = state.logs.filter(log => log.date === dateStr);
        const dayCo2Sum = dayLogs.reduce((sum, item) => sum + item.co2, 0);
        
        last7Days.push({
            label: weekdayLabels[d.getDay()],
            co2: dayCo2Sum
        });
    }

    const historyCanvas = document.getElementById('historyChart');
    updateHistoryChart(historyCanvas, last7Days);
}

/**
 * Initialize application events
 */
function initEvents() {
    elements.activityForm.addEventListener('submit', handleLogSubmission);
    
    // Clear logs handler
    elements.btnClearLogs.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all history logs? This will reset your carbon saved calculations.")) {
            state.logs = [];
            state.completedChallenges = [];
            state.xp = 0;
            state.level = 1;
            saveState();
            renderAll();
            if (ecoTree) {
                ecoTree.update(0, 1);
                ecoTree.draw();
            }
        }
    });
}

/**
 * Application Entry point initializer
 */
function init() {
    loadState();
    
    // Setup Virtual Tree
    const canvas = document.getElementById('treeCanvas');
    if (canvas) {
        ecoTree = new EcoTree(canvas);
        ecoTree.update(state.xp, state.level);
    }

    initRouter();
    initModal();
    initEvents();
    renderAll();
}

window.addEventListener('DOMContentLoaded', init);
