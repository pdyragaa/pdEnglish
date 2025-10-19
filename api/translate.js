export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, sourceLang, targetLang } = req.body;

  if (!text || !sourceLang || !targetLang) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const DEEPL_API_KEY = process.env.VITE_DEEPL_API_KEY;
  
  if (!DEEPL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' });
  }

  try {
    const params = new URLSearchParams();
    params.append('auth_key', DEEPL_API_KEY);
    params.append('text', text);
    params.append('source_lang', sourceLang);
    params.append('target_lang', targetLang);

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `DeepL API failed: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    if (!data.translations || data.translations.length === 0) {
      return res.status(500).json({ error: 'No translation received from DeepL API' });
    }

    res.status(200).json({ 
      translatedText: data.translations[0].text 
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: `Translation failed: ${error.message}` 
    });
  }
}
