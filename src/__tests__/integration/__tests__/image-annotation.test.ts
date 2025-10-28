import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock annotation system - replace with actual imports when available
interface Annotation {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
}

class AnnotationManager {
  private annotations: Annotation[] = [];
  private selectedAnnotation: string | null = null;

  addAnnotation(annotation: Omit<Annotation, 'id'>): string {
    const id = `annotation_${Date.now()}_${Math.random()}`;
    const newAnnotation: Annotation = { ...annotation, id };
    this.annotations.push(newAnnotation);
    return id;
  }

  removeAnnotation(id: string): boolean {
    const index = this.annotations.findIndex(a => a.id === id);
    if (index !== -1) {
      this.annotations.splice(index, 1);
      if (this.selectedAnnotation === id) {
        this.selectedAnnotation = null;
      }
      return true;
    }
    return false;
  }

  getAnnotations(): Annotation[] {
    return [...this.annotations];
  }

  selectAnnotation(id: string): boolean {
    if (this.annotations.find(a => a.id === id)) {
      this.selectedAnnotation = id;
      return true;
    }
    return false;
  }

  getSelectedAnnotation(): Annotation | null {
    if (!this.selectedAnnotation) return null;
    return this.annotations.find(a => a.id === this.selectedAnnotation) || null;
  }

  updateAnnotation(id: string, updates: Partial<Annotation>): boolean {
    const annotation = this.annotations.find(a => a.id === id);
    if (annotation) {
      Object.assign(annotation, updates);
      return true;
    }
    return false;
  }
}

class ImageViewer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private annotationManager: AnnotationManager;
  private zoom: number = 1;
  private panX: number = 0;
  private panY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.annotationManager = new AnnotationManager();
  }

  setTransform(zoom: number, panX: number, panY: number): void {
    this.zoom = zoom;
    this.panX = panX;
    this.panY = panY;
    this.render();
  }

  addAnnotation(annotation: Omit<Annotation, 'id'>): string {
    return this.annotationManager.addAnnotation(annotation);
  }

  removeAnnotation(id: string): boolean {
    return this.annotationManager.removeAnnotation(id);
  }

  getAnnotations(): Annotation[] {
    return this.annotationManager.getAnnotations();
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render annotations
    this.annotationManager.getAnnotations().forEach(annotation => {
      this.renderAnnotation(annotation);
    });
  }

  private renderAnnotation(annotation: Annotation): void {
    this.ctx.save();
    this.ctx.strokeStyle = annotation.color;
    this.ctx.lineWidth = 2;
    
    switch (annotation.type) {
      case 'rectangle':
        this.ctx.strokeRect(annotation.x, annotation.y, annotation.width || 0, annotation.height || 0);
        break;
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(annotation.x, annotation.y, annotation.radius || 0, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;
      case 'text':
        this.ctx.fillStyle = annotation.color;
        this.ctx.fillText(annotation.text || '', annotation.x, annotation.y);
        break;
    }
    
    this.ctx.restore();
  }
}

describe('Image Annotation Integration', () => {
  let canvas: HTMLCanvasElement;
  let imageViewer: ImageViewer;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    imageViewer = new ImageViewer(canvas);
  });

  afterEach(() => {
    document.body.removeChild(canvas);
  });

  describe('Annotation Management', () => {
    it('should add rectangle annotation', () => {
      const id = imageViewer.addAnnotation({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: '#ff0000'
      });

      expect(id).toBeDefined();
      const annotations = imageViewer.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]?.type).toBe('rectangle');
    });

    it('should add circle annotation', () => {
      const id = imageViewer.addAnnotation({
        type: 'circle',
        x: 300,
        y: 300,
        radius: 50,
        color: '#00ff00'
      });

      expect(id).toBeDefined();
      const annotations = imageViewer.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]?.type).toBe('circle');
    });

    it('should add text annotation', () => {
      const id = imageViewer.addAnnotation({
        type: 'text',
        x: 50,
        y: 50,
        text: 'Test annotation',
        color: '#0000ff'
      });

      expect(id).toBeDefined();
      const annotations = imageViewer.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]?.type).toBe('text');
      expect(annotations[0]?.text).toBe('Test annotation');
    });
  });

  describe('Annotation Operations', () => {
    let annotationId: string;

    beforeEach(() => {
      annotationId = imageViewer.addAnnotation({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: '#ff0000'
      });
    });

    it('should remove annotation', () => {
      expect(imageViewer.getAnnotations()).toHaveLength(1);
      
      const removed = imageViewer.removeAnnotation(annotationId);
      expect(removed).toBe(true);
      expect(imageViewer.getAnnotations()).toHaveLength(0);
    });

    it('should handle removing non-existent annotation', () => {
      const removed = imageViewer.removeAnnotation('non-existent-id');
      expect(removed).toBe(false);
      expect(imageViewer.getAnnotations()).toHaveLength(1);
    });
  });

  describe('Multiple Annotations', () => {
    it('should handle multiple annotations', () => {
      imageViewer.addAnnotation({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: '#ff0000'
      });

      imageViewer.addAnnotation({
        type: 'circle',
        x: 300,
        y: 300,
        radius: 50,
        color: '#00ff00'
      });

      imageViewer.addAnnotation({
        type: 'text',
        x: 50,
        y: 50,
        text: 'Multiple annotations',
        color: '#0000ff'
      });

      const annotations = imageViewer.getAnnotations();
      expect(annotations).toHaveLength(3);
      expect(annotations.map(a => a.type)).toEqual(['rectangle', 'circle', 'text']);
    });

    it('should maintain annotation order', () => {
      const id1 = imageViewer.addAnnotation({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: '#ff0000'
      });

      const id2 = imageViewer.addAnnotation({
        type: 'circle',
        x: 300,
        y: 300,
        radius: 50,
        color: '#00ff00'
      });

      const annotations = imageViewer.getAnnotations();
      expect(annotations[0]?.id).toBe(id1);
      expect(annotations[1]?.id).toBe(id2);
    });
  });

  describe('Transform Integration', () => {
    it('should maintain annotations during zoom and pan', () => {
      const id = imageViewer.addAnnotation({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: '#ff0000'
      });

      // Apply transform
      imageViewer.setTransform(2, 50, 75);

      // Annotation should still exist
      const annotations = imageViewer.getAnnotations();
      expect(annotations).toHaveLength(1);
      expect(annotations[0]?.id).toBe(id);
    });
  });
});
