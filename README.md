# Hatır Gönül 💜

**Hatır Gönül**, kullanıcının günlük duygu durumunu takip eden, empatik bir yapay zeka ile dertleşmesini sağlayan ve rastgele zamanlarda hal hatır soran yeni nesil bir "Sanal Dost & Ruh Hali Takipçisi" mobil uygulamasıdır. Günlük rutinin sıkıcılığından uzak, modern ve "premium" hissettiren bir tasarıma (Koyu Tema & Glassmorphism) sahiptir.

<br>

## ✨ Özellikler

*   **🎙️ Yapay Zeka (AI) Destekli Sohbet:** Sistem, sana isminle hitap eden ve ruh halini göz önünde bulundurarak cevaplar üreten empatik bir yapay zekaya sahiptir. (Llama 70B modeli üzerinden Türkçe olarak çalışır).
*   **📊 Ruh Hali Takibi & İstatistikler:** Her yeni gün uygulamaya girildiğinde ruh halinizi (`Çok Kötü`'den `Harika`'ya kadar 5 farklı seviye) sorar. Bu veriler Ruh Hali Geçmişi panelinde analiz edilip trendler (↗ İyileşiyor, ↘ Düşüyor) olarak sunulur.
*   **⏰ Akıllı Rastgele Bildirim Motoru:** Sizi sabit makine saatlerinden (her gün 19:00 gibi) kurtarır. Uygulama, arka planda gelecek 14 gün için sabah, öğle ve akşam saatlerinde saniyesi saniyesine rastgele zamanlar hesaplayarak *yerel bildirimler (offline push notifications)* kurar. (Bildirimler cihaz internetsizken bile düşer).
*   **💬 Çekmeceli Sohbet Geçmişi Sistemi:** Sohbetlerin eski kalabalıklarını arındırır. Uygulamaya her girdiğinizde taze bir sohbet oturumu açılırken, tüm mesajlarınız arka planda kaydedilir. Sol üstteki menü ikonuna basıp **Dinamik Çekmeceyi (Drawer)** açtığınızda tüm konuşmalarınıza gün gün ulaşabilirsiniz. Kaybolan hiçbir kelime olmaz.
*   **🏠 Dinamik Panel (Home Screen):** Sisteme girişte karşılayan, o günkü durumunuzu özetleyen, zamana duyarlı ("Günaydın" / "İyi Akşamlar") ana komuta merkezi.

<br>

## 🛠️ Kullanılan Teknolojiler ve Teknikler

Hatır Gönül modern bir **TypeScript** ve **React Native / Expo** mimarisi üzerinde inşa edilmiştir.

*   **Framework:** `React Native` & `Expo`
*   **Dil:** Kesin tipli güvenilir yapı için `%100 TypeScript`.
*   **Yapay Zeka Servisi:** `Groq API (Llama-3.3-70b-versatile)`. Mesaj ve oturumlar için karmaşık dil sistemleri (LLM) entegrasyonu yazılmıştır. Dinamik `SYSTEM_INSTRUCTION` taktikleriyle AI bota kullanıcı profili dinamik olarak yedirilir.
*   **Yerel Veri Saklama (Persistence):** `@react-native-async-storage/async-storage`. Sohbetler, günlük ruh halleri ve cihaz ayarları internetsiz erişim için cihaz hafızasına kronolojik JSON yapısında kaydedilir. İd bazlı filtreleme (**Deduplication Algoritması**) ile mesaj yığılma hatası önlenmiştir.
*   **Navigasyon:** `@react-navigation/native` ve `bottom-tabs`. Ekran verisi tazelemesi (Data Fetching) için reaktif `useFocusEffect` kancalarıyla mimari hızlandırılmıştır.
*   **Tasarım Mimarisi:** Modern `expo-linear-gradient` desteği, SafeArea, Haptic hisleri(eksik/yakında) ve Animated API ile oluşturulmuş soldan kayan fiziksel pürüzsüz çekmece dizaynı.

<br>

## 🚀 Kurulum ve Başlangıç

Projeyi kendi ortamınızda test etmek ve çalıştırmak için:

1. Bağımlılıkları kurun:
   \`\`\`bash
   npm install
   \`\`\`

2. Arka planda `Groq API` (AI beyni) için ortam değişkeninizi oluşturun. Proje ana dizininde `.env` dosyası yaratın ve içerisine kopyalayın:
   \`\`\`env
   EXPO_PUBLIC_GROQ_API_KEY=groq_api_anahtariniz_buraya
   \`\`\`

3. Expo geliştirici sunucusunu ayağa kaldırın:
   \`\`\`bash
   npm start
   \`\`\`
   *(Veya doğrudan Android Emülatörü için: `npm run android`)*

<br>

## 📂 Klasör Mimarisi Özeti

- **/src/services:** (Storage, Gemini, Notification) – Uygulamanın bütün beyin takımının barındığı klasör. Arka plan işlemleri burada yönetilir.
- **/src/screens:** Ana UI görünümlerinin, bileşen ev sahiplerinin yapıldığı klasör (`HomeScreen.tsx`, `ChatScreen.tsx` vs.).
- **/src/components:** (ChatBubble, MoodSelector, TypingIndicator vb.) Tekrar kullanılabilir (re-usable) parçaların barındığı klasör.
- **/src/theme:** Typography, Gradient'lar ve Proje renk kodlarının (Dark/Premium) tutulduğu kütüphane.

<br>
<div align="center">
  <i>Hatır Gönül - Sen nasıl hissedersen, biz öyle varız 💜</i>
</div>
