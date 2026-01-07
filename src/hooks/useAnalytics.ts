import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const usePageView = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await supabase.from('page_views').insert({
          page_path: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: getSessionId(),
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};

export const trackEvent = async (eventType: string, eventData?: object, pagePath?: string) => {
  try {
    await supabase.from('analytics_events').insert([{
      event_type: eventType,
      event_data: eventData ? JSON.parse(JSON.stringify(eventData)) : {},
      page_path: pagePath || window.location.pathname,
      session_id: getSessionId(),
    }]);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

export const useAnalytics = () => {
  usePageView();
  return { trackEvent };
};
