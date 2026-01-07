-- Create contacts table for storing contact form submissions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table for dynamic project management
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL DEFAULT 'Computer Vision',
  technologies TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for AI chatbot history
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_views table for visitor analytics
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_events table for engagement tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read access for projects (portfolio is public)
CREATE POLICY "Projects are viewable by everyone" 
ON public.projects FOR SELECT 
USING (true);

-- Public insert for contacts (anyone can submit contact form)
CREATE POLICY "Anyone can submit contact form" 
ON public.contacts FOR INSERT 
WITH CHECK (true);

-- Public access for chat messages (anonymous chat)
CREATE POLICY "Anyone can read their chat messages" 
ON public.chat_messages FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert chat messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (true);

-- Public insert for analytics (track all visitors)
CREATE POLICY "Anyone can insert page views" 
ON public.page_views FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events FOR INSERT 
WITH CHECK (true);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger to projects table
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial projects data
INSERT INTO public.projects (title, description, category, technologies, featured, display_order) VALUES
('Vision Systems', 'Advanced computer vision system for real-time object detection and tracking using deep learning models. Implements YOLO and custom CNN architectures for industrial applications.', 'Computer Vision', ARRAY['Python', 'TensorFlow', 'OpenCV', 'YOLO', 'Docker'], true, 1),
('Neural Network Optimizer', 'Custom optimization algorithms for training deep neural networks. Includes adaptive learning rate schedulers and gradient compression techniques.', 'Deep Learning', ARRAY['PyTorch', 'CUDA', 'NumPy', 'Matplotlib'], true, 2),
('Autonomous Navigation', 'SLAM-based navigation system for autonomous robots. Integrates LiDAR and camera fusion for robust localization in dynamic environments.', 'Robotics', ARRAY['ROS', 'C++', 'Python', 'PCL', 'SLAM'], true, 3),
('Medical Image Analysis', 'AI-powered diagnostic tool for analyzing medical images. Uses transformer-based architectures for tumor detection and classification.', 'Healthcare AI', ARRAY['Python', 'PyTorch', 'MONAI', 'FastAPI'], false, 4),
('NLP Pipeline', 'End-to-end natural language processing pipeline for document understanding and knowledge extraction from technical papers.', 'NLP', ARRAY['Python', 'Transformers', 'spaCy', 'Elasticsearch'], false, 5),
('Edge AI Deployment', 'Framework for deploying optimized deep learning models on edge devices. Supports model quantization and pruning for real-time inference.', 'Edge Computing', ARRAY['TensorRT', 'ONNX', 'Jetson', 'Python'], false, 6);