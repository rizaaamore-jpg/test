// TKJ1 Class Website - Main Application
const TKJ1App = {
    // Configuration
    config: {
        classCode: 'X-TKJ-1',
        schoolYear: '2024/2025',
        homeroomTeacher: 'Pak Agus',
        totalStudents: 36
    },

    // Initialize
    init() {
        this.loadData();
        this.setupEventListeners();
        this.startLiveUpdates();
        this.checkLoginStatus();
        this.setupServiceWorker();
    },

    // Load data from JSON files
    async loadData() {
        try {
            const responses = await Promise.all([
                fetch('data/siswa.json').then(r => r.json()),
                fetch('data/jadwal.json').then(r => r.json()),
                fetch('data/tugas.json').then(r => r.json()),
                fetch('data/materi.json').then(r => r.json())
            ]);

            this.data = {
                siswa: responses[0],
                jadwal: responses[1],
                tugas: responses[2],
                materi: responses[3]
            };

            this.renderDashboard();
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    },

    // Presensi System
    presensi: {
        generateQR() {
            const code = `TKJ1-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`;
            
            document.getElementById('qrContainer').innerHTML = `
                <img src="${qrUrl}" alt="QR Presensi">
                <p>Kode: ${code}</p>
                <p>⏱️ Berlaku 2 menit</p>
            `;

            // Auto refresh every 2 minutes
            setTimeout(() => this.generateQR(), 120000);
        },

        async submitPresensi(siswaId, status = 'hadir') {
            const presensiData = {
                siswa_id: siswaId,
                tanggal: new Date().toISOString().split('T')[0],
                waktu: new Date().toLocaleTimeString(),
                status: status,
                location: await this.getLocation()
            };

            // Save to localStorage
            const history = JSON.parse(localStorage.getItem('presensi_history') || '[]');
            history.push(presensiData);
            localStorage.setItem('presensi_history', JSON.stringify(history));

            return { success: true, data: presensiData };
        }
    },

    // Tugas Management
    tugas: {
        async getActiveTugas() {
            return this.data.tugas.filter(t => 
                new Date(t.deadline) > new Date() && !t.submitted
            );
        },

        submitTugas(tugasId, file) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const submission = {
                        tugas_id: tugasId,
                        siswa_id: this.getCurrentUser().id,
                        file: e.target.result,
                        filename: file.name,
                        submitted_at: new Date().toISOString(),
                        status: 'submitted'
                    };

                    // Save to localStorage
                    const submissions = JSON.parse(localStorage.getItem('tugas_submissions') || '[]');
                    submissions.push(submission);
                    localStorage.setItem('tugas_submissions', JSON.stringify(submissions));

                    resolve({ success: true, submission });
                };
                reader.readAsDataURL(file);
            });
        }
    },

    // Chat System
    chat: {
        messages: [],
        onlineUsers: [],

        sendMessage(text, sender) {
            const message = {
                id: Date.now(),
                text: text,
                sender: sender,
                time: new Date().toLocaleTimeString(),
                type: 'text'
            };

            this.messages.push(message);
            this.saveMessages();
            this.updateChatUI();

            // Simulate reply if from teacher
            if (sender === 'guru') {
                setTimeout(() => this.autoReply(text), 1000);
            }
        },

        autoReply(message) {
            const replies = [
                "Paham, lanjutkan!",
                "Ada yang perlu ditanyakan?",
                "Jangan lupa deadline tugas besok!",
                "Good job!",
                "Coba dijelaskan lebih detail"
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            
            this.sendMessage(reply, 'Miss Qotrunnada (Wali Kelas)');
        }
    },

    // Virtual Lab
    lab: {
        openCodeEditor() {
            return `
                <div class="code-lab">
                    <h3>💻 Code Editor Online</h3>
                    <div class="editor-area">
                        <select id="language">
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="js">JavaScript</option>
                            <option value="php">PHP</option>
                            <option value="python">Python</option>
                        </select>
                        <textarea id="code" placeholder="Ketik kode disini..."></textarea>
                        <button onclick="runCode()">🚀 Run</button>
                    </div>
                    <div class="preview">
                        <iframe id="preview"></iframe>
                    </div>
                </div>
            `;
        },

        openNetworkSimulator() {
            return `
                <div class="network-lab">
                    <h3>🌐 Network Simulator</h3>
                    <div class="topology">
                        <div class="device router" draggable="true">Router</div>
                        <div class="device switch" draggable="true">Switch</div>
                        <div class="device pc" draggable="true">PC</div>
                        <div class="device server" draggable="true">Server</div>
                    </div>
                    <div class="terminal">
                        <pre id="terminal-output"></pre>
                        <input type="text" id="terminal-input" placeholder="ping 192.168.1.1">
                    </div>
                </div>
            `;
        }
    },

    // Render Functions
    renderDashboard() {
        const container = document.getElementById('activityFeed');
        if (!container) return;

        const activities = [
            `✅ ${this.data.siswa.filter(s => s.presensi_today).length} siswa telah presensi`,
            `📝 ${this.data.tugas.filter(t => !t.submitted).length} tugas belum dikumpulkan`,
            `🏆 Ranking teratas: ${this.getTopStudents().join(', ')}`,
            `💬 ${this.chat.messages.length} pesan dalam chat hari ini`
        ];

        container.innerHTML = activities.map(act => 
            `<div class="activity-item">${act}</div>`
        ).join('');
    },

    // Utility Functions
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('current_user')) || 
               { id: 0, name: 'Guest', role: 'guest' };
    },

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(() => console.log('Service Worker Registered'))
                .catch(err => console.log('SW Registration Failed:', err));
        }
    },

    startLiveUpdates() {
        // Update online count every 30 seconds
        setInterval(() => {
            const online = Math.floor(Math.random() * 10) + 20;
            document.getElementById('onlineCount').textContent = online;
        }, 30000);

        // Refresh data every minute
        setInterval(() => this.loadData(), 60000);
    }
};

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => TKJ1App.init());
