import { GoogleGenerativeAI, Content } from '@google/generative-ai';

const API_KEY = 'AIzaSyC9-FOTzHsk59Sviimng46_-0vLmcYcMv0';

const genAI = new GoogleGenerativeAI(API_KEY);

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
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    let mappedMessages = messages.filter((m) => m.role === 'user' || m.role === 'model');
    
    // Gemini API requires history to start with a 'user' role
    if (mappedMessages.length > 0 && mappedMessages[0].role === 'model') {
      mappedMessages = [
        { id: 'dummy', role: 'user', text: 'Merhaba, bugün nasılsın?', timestamp: new Date() },
        ...mappedMessages
      ];
    }

    const history: Content[] = mappedMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Mesaj gönderilemedi. Lütfen tekrar dene.');
  }
}

export async function analyzeMood(moodScore: number): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const moodLabels = ['çok kötü', 'kötü', 'orta', 'iyi', 'harika'];
    const moodLabel = moodLabels[moodScore - 1] || 'orta';

    const prompt = `Kullanıcı şu an kendini ${moodLabel} hissediyor (${moodScore}/5). Bunu öğrenince bir arkadaş olarak kısa, samimi ve destekleyici bir karşılama mesajı yaz. 1-2 cümle yeterli.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Mood analysis error:', error);
    return 'Seninle burada olmaktan mutluyum 💜 Anlat bakalım, bugün nasıl geçiyor?';
  }
}
