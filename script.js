// TKJ1 Website - Main Application File
class TKJ1Website {
    constructor() {
        this.version = '3.0.0';
        this.features = {
            admin: true,
            presensi: true,
            nilai: true,
            tugas: true,
            chat: true,
            lab: true,
            videoCall: true,
            screenShare: true,
            arViewer: true,
            aiTutor: true
        };
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.initializeModules();
        this.checkLogin();
        this.setupServiceWorker();
        this.startAutoBackup();
    }
    
    loadData() {
        // Load all JSON data
        const dataFiles = [
            'data/siswa.json',
            'data/jadwal.json',
            'data/tugas.json',
            'data/nilai.json',
            'data/materi.json'
        ];
        
        dataFiles.forEach(file => {
            fetch(file)
                .then(r => r.json())
                .then(data => this[file.split('/')[1].replace('.json', '')] = data)
                .catch(err => console.error(`Failed to load ${file}:`, err));
        });
    }
    
    initializeModules() {
        // Initialize all modules
        this.modules = {
            faceDetection: new FaceDetection(),
            qrSystem: new QRSystem(),
            videoCall: new VideoCallSystem(),
            screenShare: new ScreenShare(),
            aiTutor: new AITutor(),
            arViewer: new ARViewer(),
            codeEditor: new CodeEditor(),
            networkSim: new NetworkSimulator()
        };
    }
}

// Start application
const app = new TKJ1Website();
window.addEventListener('DOMContentLoaded', () => app.init());
