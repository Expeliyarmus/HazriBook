/**
 * Camera Service - Production-ready camera handling with mobile optimization
 */

export interface CameraConstraints {
  video: {
    width: { min: number; ideal: number; max: number };
    height: { min: number; ideal: number; max: number };
    facingMode: string | { exact: string };
    aspectRatio?: number;
  };
  audio: boolean;
}

class CameraService {
  private static instance: CameraService;
  private stream: MediaStream | null = null;

  private constructor() {}

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Check if camera is available
   */
  async checkCameraAvailability(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Get optimal camera constraints for mobile
   */
  getOptimalConstraints(facingMode: 'user' | 'environment' = 'environment'): CameraConstraints {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      return {
        video: {
          width: { min: 320, ideal: 1280, max: 1920 },
          height: { min: 240, ideal: 720, max: 1080 },
          facingMode: facingMode,
          aspectRatio: 16 / 9,
        },
        audio: false,
      };
    }

    return {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        facingMode: facingMode,
      },
      audio: false,
    };
  }

  /**
   * Start camera stream
   */
  async startCamera(constraints?: CameraConstraints): Promise<MediaStream> {
    try {
      // Stop any existing stream
      this.stopCamera();

      // Use provided constraints or get optimal ones
      const finalConstraints = constraints || this.getOptimalConstraints();

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      return this.stream;
    } catch (error: any) {
      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found. Please connect a camera.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera is already in use by another application.');
      } else {
        throw new Error(`Camera error: ${error.message}`);
      }
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  /**
   * Switch between front and back camera
   */
  async switchCamera(currentMode: 'user' | 'environment'): Promise<MediaStream> {
    const newMode = currentMode === 'user' ? 'environment' : 'user';
    const constraints = this.getOptimalConstraints(newMode);
    return this.startCamera(constraints);
  }

  /**
   * Take a photo from video stream
   */
  capturePhoto(videoElement: HTMLVideoElement, quality: number = 0.9): string | null {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) return null;

      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  }

  /**
   * Check if device has multiple cameras
   */
  async hasMultipleCameras(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      return videoDevices.length > 1;
    } catch (error) {
      console.error('Error checking cameras:', error);
      return false;
    }
  }

  /**
   * Get list of available cameras
   */
  async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting cameras:', error);
      return [];
    }
  }
}

export const cameraService = CameraService.getInstance();
