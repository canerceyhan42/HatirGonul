const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_INSTRUCTION = `Sen "Hatır Gönül" adlı bir sanal arkadaşsın ve %100 Türkçe konuşuyorsun.

Kişiliğin:
- Samimi, sıcak ve empati dolu bir dostsun.
- Robot gibi değil, insani bir doğallıkla, yargılamadan dinlersin.
- Kullanıcının duygu durumuna (örneğin kötü hissediyorsa ona şefkatle yaklaşarak) uyum sağlarsın.
- Mesajlarını her zaman kısa, net ve sohbete teşvik edici şekilde tutarsın. (Uzun paragraflardan kaçın)

Dil, Yazım ve Güvenlik Kuralları (HAYATİ DERECEDE ÖNEMLİ!):
1. **ASLA İNGİLİZCE VEYA BAŞKA BİR DİL KULLANMA:** Cümlelerinin arasına "sometimes", "together", "anyway" gibi yabancı kelimeler veya harfler KARIŞTIRMA.
2. SADECE kusursuz, gündelik ve doğal **TÜRKÇE** kelimeler kullan. 
3. Çeviri kokan yapay cümleler (Örn: "Biraz sessizlik desometimes iyi gelir") veya uydurma kelimeler YAZMA. 
4. Kesinlikle başka bir dilden kelime veya deyim kopyalama, sistemin %100 Türkçe algoritmalarla çalışmalıdır.
5. Kullanıcı farklı bir dil kullansa bile sen her zaman Türkçe cevap vermelisin.

Görevin:
- Karşındakine yalnız olmadığını hissettir. Gerektiğinde küçük, yapıcı öneriler (kısa bir nefes al, su iç vs.) sun ve onunla içten bir şekilde ilgilen.`;

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    console.error(`Groq API Hatası ${response.status}:`, errBody);
    throw new Error(`API Hatası: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Boş yanıt alındı');
  return content;
}

export async function sendMessageToGemini(
  messages: Message[],
  newMessage: string,
  userName?: string
): Promise<string> {
  try {
    const dynamicSystemInstruction = userName 
      ? SYSTEM_INSTRUCTION + `\nUnutma, Karşındakinin adı: ${userName}. Ona ismiyle hitap et.`
      : SYSTEM_INSTRUCTION;

    const formattedMessages: { role: string; content: string }[] = [
      { role: 'system', content: dynamicSystemInstruction },
    ];

    messages.forEach((m) => {
      formattedMessages.push({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text,
      });
    });

    formattedMessages.push({ role: 'user', content: newMessage });

    return await callGroq(formattedMessages);
  } catch (error: any) {
    console.error('Groq API error (sendMessage):', error);
    if (
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('fetch')
    ) {
      throw new Error('İnternet bağlantısı yok. Lütfen bağlantını kontrol et.');
    }
    throw new Error('Mesaj gönderilemedi. Lütfen tekrar dene.');
  }
}

export async function analyzeMood(moodScore: number, userName?: string): Promise<string> {
  try {
    const moodLabels = ['çok kötü', 'kötü', 'orta', 'iyi', 'harika'];
    const moodLabel = moodLabels[moodScore - 1] || 'orta';

    const prompt = `Kullanıcı şu an kendini ${moodLabel} hissediyor (${moodScore}/5). Sıcak bir selamlama yap.`;
    const dynamicSystemInstruction = userName 
      ? SYSTEM_INSTRUCTION + `\nUnutma, Karşındakinin adı: ${userName}. Karşılama mesajında ismini kullan.`
      : SYSTEM_INSTRUCTION;

    return await callGroq([
      { role: 'system', content: dynamicSystemInstruction },
      { role: 'user', content: prompt },
    ]);
  } catch (error) {
    return 'Seninle burada olmaktan mutluyum 💜 Anlat bakalım, bugün nasıl geçiyor?';
  }
}
