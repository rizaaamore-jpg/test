// Face Recognition Login System
class FaceDetection {
    constructor() {
        this.modelLoaded = false;
        this.video = document.createElement('video');
    }
    
    async loadModels() {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        this.modelLoaded = true;
    }
    
    async detectFace() {
        if (!this.modelLoaded) await this.loadModels();
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        this.video.srcObject = stream;
        await this.video.play();
        
        const detection = await faceapi.detectSingleFace(
            this.video, 
            new faceapi.TinyFaceDetectorOptions()
        );
        
        if (detection) {
            return this.recognizeFace(detection.descriptor);
        }
        
        return null;
    }
}
