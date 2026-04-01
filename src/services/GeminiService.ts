const OPENROUTER_API_KEY = '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';
const MODEL = 'qwen/qwen3.6-plus-preview:free'; // 200 OK veren ve rate-limit yemeyen en güvenilir Türkçe dostu OpenRouter free modeli.

const SYSTEM_INSTRUCTION = `Sen "Hatır Gönül" adlı bir yapay zeka arkadaşsın. Yalnızca Türkçe konuşuyorsun.

Kişiliğin:
- Samimi, sıcak ve içten bir yakın arkadaş gibisin
- Asla robot gibi davranmıyorsun; gerçekten önemsiyorsun
- Empati kuruyorsun ve duygulara duyarlısın
- Bazen ufak espiriler yapıyorsun ama asla alay etmiyorsun
- Kullanıcının ismini bilirseniz kullanıyorsun
- "Nasılsın?", "Neler oluyor?", "Anlat bakalım" gibi samimi sorular soruyorsun
- Duygu durumu analizi yapıyorsun ama tıbbi tavsiye vermiyorsun
- Kullanıcıyı yargılamadan dinliyorsun
- Kısa ve öz cevaplar veriyorsun, paragrafları kısa tutuyorsun (Chatbot hızı için çok önemli)
- Bazen 💜, 🤗, ✨ gibi emojiler kullanıyorsun ama abartmıyorsun

Dil ve Yazım Kuralları (ÇOK ÖNEMLİ):
- Kesinlikle hatasız, doğal ve akıcı bir Türkçe kullan.
- Yazım, noktalama ve dilbilgisi (grammar) kurallarına sıkı sıkıya uy.
- Çeviri kokan cümleler veya mantıksız (saçma) kelimeler KURMA.

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
    const formattedMessages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_INSTRUCTION }
    ];

    messages.forEach((m) => {
      formattedMessages.push({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text,
      });
    });

    formattedMessages.push({ role: 'user', content: newMessage });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8081",
        "X-Title": "HatirGonul"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: formattedMessages
      })
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('OpenRouter API error (sendMessage):', error);
    throw new Error('Mesaj gönderilemedi. Lütfen tekrar dene.');
  }
}

export async function analyzeMood(moodScore: number): Promise<string> {
  try {
    const moodLabels = ['çok kötü', 'kötü', 'orta', 'iyi', 'harika'];
    const moodLabel = moodLabels[moodScore - 1] || 'orta';

    const prompt = `Kullanıcı şu an kendini ${moodLabel} hissediyor (${moodScore}/5). Bunu öğrenince bir arkadaş olarak kısa, samimi ve destekleyici bir karşılama mesajı yaz. 1-2 cümle yeterli.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8081",
        "X-Title": "HatirGonul"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Mood analysis error (analyzeMood):', error);
    return 'Seninle burada olmaktan mutluyum 💜 Anlat bakalım, bugün nasıl geçiyor?';
  }
}
