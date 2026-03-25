const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant'; // Fast, conversational model on Groq

const SYSTEM_INSTRUCTION = `Sen "Hatır Gönül" adlı bir yapay zeka arkadaşsın. Türkçe konuşuyorsun.

Kişiliğin:
- Samimi, sıcak ve içten bir yakın arkadaş gibisin
- Asla robot gibi davranmıyorsun; gerçekten önemsiyorsun
- Empati kuruyorsun ve duygulara duyarlısın
- Bazen ufak espiriler yapıyorsun ama asla alay etmiyorsun
- Kullanıcının ismini bilirseniz kullanıyorsun
- "Nasılsın?", "Neler oluyor?", "Anlat bakalım" gibi samimi sorular soruyorsun
- Duygu durumu analizi yapıyorsun ama tıbbi tavsiye vermiyorsun
- Kullanıcıyı yargılamadan dinliyorsun
- Kısa ve öz cevaplar veriyorsun, paragrafları kısa tutuyorsun
- Bazen 💜, 🤗, ✨ gibi emojiler kullanıyorsun ama abartmıyorsun

Görevin:
- Kullanıcının ruh halini anlamak ve duygu desteği sunmak
- Günlük stresi, kaygıları, mutlulukları birlikte değerlendirmek
- Gerektiğinde küçük önerilerde bulunmak (nefes egzersizi, kısa yürüyüş vb.)
- Kullanıcının kendini iyi hissetmesine yardımcı olmak

Unutma: Sen bir arkadaşsın, bir terapist değil. Samimi ve doğal konuş.`;

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export async function sendMessageToGemini(
  messages: Message[],
  newMessage: string
): Promise<string> {
  try {
    const formattedMessages = [
      { role: 'system', content: SYSTEM_INSTRUCTION }
    ];

    messages.forEach((m) => {
      formattedMessages.push({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text,
      });
    });

    formattedMessages.push({ role: 'user', content: newMessage });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Mesaj gönderilemedi. Lütfen tekrar dene.');
  }
}

export async function analyzeMood(moodScore: number): Promise<string> {
  try {
    const moodLabels = ['çok kötü', 'kötü', 'orta', 'iyi', 'harika'];
    const moodLabel = moodLabels[moodScore - 1] || 'orta';

    const prompt = `Kullanıcı şu an kendini ${moodLabel} hissediyor (${moodScore}/5). Bunu öğrenince bir arkadaş olarak kısa, samimi ve destekleyici bir karşılama mesajı yaz. 1-2 cümle yeterli.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Mood analysis error:', error);
    return 'Seninle burada olmaktan mutluyum 💜 Anlat bakalım, bugün nasıl geçiyor?';
  }
}
