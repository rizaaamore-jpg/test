// Video Conference System
class VideoCallSystem {
    constructor() {
        this.peers = {};
        this.localStream = null;
        this.roomId = null;
    }
    
    async joinClassRoom(roomId = 'tkj1-classroom') {
        this.roomId = roomId;
        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Show local video
        document.getElementById('local-video').srcObject = this.localStream;
        
        // Connect to signaling server (WebSocket)
        this.socket = new WebSocket('wss://signaling-server.example.com');
        this.setupWebSocket();
    }
    
    setupWebSocket() {
        this.socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'offer') {
                await this.handleOffer(data);
            } else if (data.type === 'answer') {
                await this.handleAnswer(data);
            } else if (data.type === 'ice-candidate') {
                await this.handleIceCandidate(data);
            } else if (data.type === 'user-joined') {
                this.addUser(data.userId);
            } else if (data.type === 'user-left') {
                this.removeUser(data.userId);
            }
        };
    }
}
