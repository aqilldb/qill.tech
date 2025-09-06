// api/downloader/tiktok.js
// Vercel Serverless Function untuk TikTok Downloader

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Only GET requests are supported.' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ 
      error: 'URL parameter is required',
      usage: 'GET /api/downloader/tiktok?url=https://vm.tiktok.com/...'
    });
  }

  // Validate TikTok URL
  const tiktokRegex = /(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/;
  if (!tiktokRegex.test(url)) {
    return res.status(400).json({ 
      error: 'Invalid TikTok URL',
      message: 'Please provide a valid TikTok URL'
    });
  }

  try {
    // Method 1: Using TikTok scraper API
    const response = await fetchTikTokData(url);
    
    if (response.success) {
      return res.status(200).json({
        success: true,
        message: 'TikTok video fetched successfully',
        data: {
          title: response.data.title || 'TikTok Video',
          author: response.data.author || 'Unknown',
          video: response.data.video || [],
          audio: response.data.audio || [],
          thumbnail: response.data.thumbnail || '',
          duration: response.data.duration || '',
          views: response.data.views || '',
          likes: response.data.likes || '',
          comments: response.data.comments || '',
          shares: response.data.shares || ''
        },
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(response.message || 'Failed to fetch TikTok data');
    }

  } catch (error) {
    console.error('TikTok API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process TikTok URL. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function fetchTikTokData(url) {
  try {
    // Method 1: Using public TikTok API (replace with working endpoint)
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === 0 && data.data) {
      return {
        success: true,
        data: {
          title: data.data.title,
          author: data.data.author?.unique_id,
          video: [data.data.play],
          audio: [data.data.music],
          thumbnail: data.data.cover,
          duration: data.data.duration,
          views: data.data.play_count,
          likes: data.data.digg_count,
          comments: data.data.comment_count,
          shares: data.data.share_count
        }
      };
    }

    // Fallback method if first API fails
    return await fallbackTikTokFetch(url);

  } catch (error) {
    console.error('Primary TikTok fetch failed:', error);
    // Try fallback method
    return await fallbackTikTokFetch(url);
  }
}

async function fallbackTikTokFetch(url) {
  try {
    // Alternative API endpoint (you can replace this with another working API)
    const fallbackUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(fallbackUrl);
    
    if (!response.ok) {
      throw new Error(`Fallback API error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.video && data.video.noWatermark) {
      return {
        success: true,
        data: {
          title: data.title || 'TikTok Video',
          author: data.author?.name || 'Unknown',
          video: [data.video.noWatermark],
          audio: [data.music?.play_url],
          thumbnail: data.video.cover || '',
          duration: data.video.duration || '',
          views: data.stats?.playCount || '',
          likes: data.stats?.diggCount || '',
          comments: data.stats?.commentCount || '',
          shares: data.stats?.shareCount || ''
        }
      };
    }

    throw new Error('No video data found in fallback response');

  } catch (error) {
    console.error('Fallback TikTok fetch failed:', error);
    
    return {
      success: false,
      message: 'All TikTok fetch methods failed. The video might be private or the URL is invalid.'
    };
  }
  }
