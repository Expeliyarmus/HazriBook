// import * as faceapi from 'face-api.js'; // Uncomment when using real face detection
import { Student, FaceDetectionResult } from '../types';

// Model URLs from CDN (for production, you might want to host these locally)
// const MODEL_URL = '/models'; // Uncomment when using real models

class FaceApiService {
  private modelsLoaded = false;
  private modelLoadPromise: Promise<void> | null = null;

  // Initialize and load models
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    if (this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    console.log('[FaceAPI] Loading models...');

    this.modelLoadPromise = (async () => {
      try {
        // For now, we'll use mock detection since face-api.js models need to be downloaded
        // In production, you would load these from a CDN or local server

        // await Promise.all([
        //   faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        //   faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        //   faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        //   faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        //   faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        // ]);

        this.modelsLoaded = true;
        console.log('[FaceAPI] Models loaded successfully');
      } catch (error) {
        console.error('[FaceAPI] Error loading models:', error);
        throw error;
      }
    })();

    return this.modelLoadPromise;
  }

  // Detect faces in an image
  async detectFaces(_imageElement: HTMLImageElement): Promise<FaceDetectionResult[]> {
    // For demo purposes, return mock data
    // In production, you would use real face detection
    return this.mockDetectFaces();
  }

  // Extract face descriptor from an image
  async extractFaceDescriptor(_imageElement: HTMLImageElement): Promise<Float32Array | null> {
    try {
      await this.loadModels();

      // Mock implementation for demo
      // In production:
      // const detection = await faceapi
      //   .detectSingleFace(imageElement)
      //   .withFaceLandmarks()
      //   .withFaceDescriptor();

      // return detection?.descriptor || null;

      // Return mock descriptor
      return new Float32Array(128).fill(Math.random());
    } catch (error) {
      console.error('[FaceAPI] Error extracting face descriptor:', error);
      return null;
    }
  }

  // Compare two face descriptors
  compareFaces(_descriptor1: Float32Array, _descriptor2: Float32Array): number {
    // Mock implementation
    // In production, you would use:
    // const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    // return 1 - distance; // Convert distance to similarity score

    return Math.random() * 0.5 + 0.5; // Mock similarity between 0.5 and 1
  }

  // Find matching student from detected face
  findMatchingStudent(
    faceDescriptor: Float32Array,
    students: Student[],
    threshold: number = 0.6
  ): { student: Student; confidence: number } | null {
    let bestMatch: { student: Student; confidence: number } | null = null;
    let bestScore = 0;

    for (const student of students) {
      if (!student.faceDescriptor) continue;

      const similarity = this.compareFaces(faceDescriptor, student.faceDescriptor);

      if (similarity > threshold && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = {
          student,
          confidence: similarity,
        };
      }
    }

    return bestMatch;
  }

  // Mock detection for demo purposes
  private mockDetectFaces(): FaceDetectionResult[] {
    // Simulate detecting 2-3 faces
    const numFaces = Math.floor(Math.random() * 2) + 2;
    const results: FaceDetectionResult[] = [];

    for (let i = 0; i < numFaces; i++) {
      results.push({
        detection: {
          box: {
            x: 50 + i * 150,
            y: 50 + Math.random() * 50,
            width: 120,
            height: 150,
          },
          score: 0.95 + Math.random() * 0.05,
        },
        descriptor: new Float32Array(128).fill(Math.random()),
      });
    }

    return results;
  }

  // Process class photo for attendance
  async processClassPhoto(
    imageElement: HTMLImageElement,
    students: Student[]
  ): Promise<FaceDetectionResult[]> {
    console.log('[FaceAPI] Processing class photo...');

    const detectedFaces = await this.detectFaces(imageElement);

    // Match detected faces with students
    for (const face of detectedFaces) {
      if (face.descriptor) {
        const match = this.findMatchingStudent(face.descriptor, students);
        if (match) {
          face.studentMatch = match;
        }
      }
    }

    console.log(`[FaceAPI] Detected ${detectedFaces.length} faces`);
    return detectedFaces;
  }
}

// Export singleton instance
export const faceApiService = new FaceApiService();
