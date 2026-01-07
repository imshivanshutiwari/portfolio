import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Play, Pause, RefreshCw, Box, Eye, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import { trackEvent } from '@/hooks/useAnalytics';

interface Detection {
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  color: string;
}

const DEMO_DETECTIONS: Detection[] = [
  { label: 'Person', confidence: 0.96, bbox: { x: 10, y: 15, width: 25, height: 60 }, color: '#22c55e' },
  { label: 'Car', confidence: 0.89, bbox: { x: 50, y: 40, width: 30, height: 25 }, color: '#3b82f6' },
  { label: 'Dog', confidence: 0.78, bbox: { x: 35, y: 55, width: 15, height: 20 }, color: '#f59e0b' },
];

const VisionDemo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackEvent('vision_demo_view');
  }, []);

  const simulateDetection = () => {
    setIsProcessing(true);
    setDetections([]);
    
    let frameCount = 0;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      frameCount++;
      const elapsed = (Date.now() - startTime) / 1000;
      setFps(Math.round(frameCount / elapsed));
      setProcessedFrames(frameCount);
      
      // Gradually reveal detections
      if (frameCount === 5) setDetections([DEMO_DETECTIONS[0]]);
      if (frameCount === 10) setDetections([DEMO_DETECTIONS[0], DEMO_DETECTIONS[1]]);
      if (frameCount === 15) {
        setDetections(DEMO_DETECTIONS);
        clearInterval(interval);
        setIsProcessing(false);
        trackEvent('vision_demo_complete', { detections: DEMO_DETECTIONS.length });
      }
    }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setDetections([]);
        setProcessedFrames(0);
        trackEvent('vision_demo_upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const drawDetections = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      detections.forEach(det => {
        const x = (det.bbox.x / 100) * img.width;
        const y = (det.bbox.y / 100) * img.height;
        const w = (det.bbox.width / 100) * img.width;
        const h = (det.bbox.height / 100) * img.height;
        
        ctx.strokeStyle = det.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        
        ctx.fillStyle = det.color;
        ctx.fillRect(x, y - 25, ctx.measureText(`${det.label} ${Math.round(det.confidence * 100)}%`).width + 10, 25);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${det.label} ${Math.round(det.confidence * 100)}%`, x + 5, y - 7);
      });
    };
    img.src = selectedImage;
  };

  useEffect(() => {
    if (selectedImage && detections.length > 0) {
      drawDetections();
    }
  }, [detections, selectedImage]);

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              Interactive Demo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Vision Systems <span className="text-primary">Demo</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience real-time object detection powered by YOLO and custom CNN architectures.
              Upload an image or use the sample to see the detection in action.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Demo Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Detection Canvas
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        FPS: {fps}
                      </Badge>
                      <Badge variant="secondary">
                        Frames: {processedFrames}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                    {selectedImage ? (
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Camera className="h-16 w-16 mb-4 opacity-50" />
                        <p>Upload an image to begin detection</p>
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <div className="text-center">
                          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                          <p className="text-sm">Processing frames...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedImage('/placeholder.svg');
                        setDetections([]);
                        setProcessedFrames(0);
                      }}
                      variant="outline"
                    >
                      Use Sample
                    </Button>
                    <Button
                      onClick={simulateDetection}
                      disabled={!selectedImage || isProcessing}
                    >
                      {isProcessing ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {isProcessing ? 'Processing' : 'Run Detection'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Detections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Box className="h-4 w-4 text-primary" />
                    Detections ({detections.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detections.length > 0 ? (
                    <div className="space-y-3">
                      {detections.map((det, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-3 rounded-lg bg-muted"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: det.color }}
                              />
                              <span className="font-medium">{det.label}</span>
                            </div>
                            <Badge variant="secondary">
                              {Math.round(det.confidence * 100)}%
                            </Badge>
                          </div>
                          <Progress value={det.confidence * 100} className="h-1.5" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No detections yet. Run detection to see results.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Model Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-4 w-4 text-primary" />
                    Model Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="yolo">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="yolo">YOLOv8</TabsTrigger>
                      <TabsTrigger value="custom">Custom CNN</TabsTrigger>
                    </TabsList>
                    <TabsContent value="yolo" className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Backbone</span>
                        <span>CSPDarknet53</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Input Size</span>
                        <span>640×640</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parameters</span>
                        <span>25.9M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">mAP@0.5</span>
                        <span>53.2%</span>
                      </div>
                    </TabsContent>
                    <TabsContent value="custom" className="space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Architecture</span>
                        <span>EfficientDet-D4</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Input Size</span>
                        <span>1024×1024</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parameters</span>
                        <span>20.7M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">mAP@0.5</span>
                        <span>49.8%</span>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-4 w-4 text-primary" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Inference Time</span>
                      <span>12.3 ms</span>
                    </div>
                    <Progress value={88} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">GPU Utilization</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span>2.4 GB</span>
                    </div>
                    <Progress value={48} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VisionDemo;
