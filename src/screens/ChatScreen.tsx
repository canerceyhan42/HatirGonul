import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Message, sendMessageToGemini, analyzeMood } from '../services/GeminiService';
import { saveChatHistory, getChatHistory, saveMoodEntry, getUserName, getMoodHistory } from '../services/StorageService';
import { ChatBubble } from '../components/ChatBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { MoodSelector } from '../components/MoodSelector';
import { Colors, Gradients, Spacing, BorderRadius } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

type ChatPhase = 'mood' | 'chat';

export function ChatScreen() {
  const [allHistory, setAllHistory] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>('mood');
  const [selectedMood, setSelectedMood] = useState<number | undefined>();
  const [userName, setUserName] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [history, name, moodHist] = await Promise.all([
      getChatHistory(), 
      getUserName(), 
      getMoodHistory()
    ]);
    
    setUserName(name);
    setAllHistory(history);
    
    const todayStr = new Date().toDateString();
    setMessages([]);
    setSelectedDate(todayStr);

    const hasMoodToday = moodHist.some(m => new Date(m.date).toDateString() === todayStr);

    if (hasMoodToday) {
      setPhase('chat');
    } else {
      setPhase('mood');
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? -DRAWER_WIDTH : 0;
    Animated.timing(drawerAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const selectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const msgs = allHistory.filter(m => new Date(m.timestamp).toDateString() === dateStr);
    setMessages(msgs);
    setPhase('chat');
    toggleDrawer();
    scrollToBottom();
  };

  const getGroupedDates = () => {
    const dates = new Set(allHistory.map(m => new Date(m.timestamp).toDateString()));
    const todayStr = new Date().toDateString();
    dates.add(todayStr); // Always ensure today is an option
    return Array.from(dates).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const appendToHistoryAndSave = (newSessionMessages: Message[]) => {
    setAllHistory(prevAll => {
      const existingIds = new Set(prevAll.map(m => m.id));
      const toAdd = newSessionMessages.filter(m => !existingIds.has(m.id));
      if (toAdd.length === 0) return prevAll;

      const updatedHistory = [...prevAll, ...toAdd].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      saveChatHistory(updatedHistory);
      return updatedHistory;
    });
  };

  const handleMoodSelect = async (score: number, emoji: string, label: string) => {
    setSelectedMood(score);

    await saveMoodEntry({
      id: Date.now().toString(),
      score,
      emoji,
      label,
      date: new Date().toISOString(),
    });

    setIsTyping(true);
    setPhase('chat');
    
    const todayStr = new Date().toDateString();
    setSelectedDate(todayStr);

    let newMessages = [...messages];

    try {
      const greeting = await analyzeMood(score, userName);
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: greeting,
        timestamp: new Date(),
      };
      newMessages.push(aiMessage);
    } catch (e) {
      const fallback: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: `${emoji} durumunu gördüm. Seninle konuşmaktan mutluluk duyuyorum 💜 Nasıl yardımcı olabilirim?`,
        timestamp: new Date(),
      };
      newMessages.push(fallback);
    } finally {
      setMessages(newMessages);
      appendToHistoryAndSave(newMessages);
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await sendMessageToGemini(messages, text, userName);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      appendToHistoryAndSave(finalMessages);
      scrollToBottom();
    } catch (error: any) {
      const errMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Üzgünüm, şu an bağlanamadım. Biraz sonra tekrar dener misin? 🙏',
        timestamp: new Date(),
      };
      const currentWithErr = [...newMessages, errMessage];
      setMessages(currentWithErr);
      appendToHistoryAndSave(currentWithErr);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <ChatBubble message={item} />
  );

  const formatDateLabel = (dateStr: string) => {
    const isToday = dateStr === new Date().toDateString();
    return isToday ? 'Bugün' : dateStr;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      
      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <View style={styles.drawerOverlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: drawerAnim }] }]}>
        <LinearGradient colors={['rgba(25,25,35,0.98)', 'rgba(15,15,30,0.98)']} style={styles.drawerGradient}>
          <Text style={styles.drawerHeaderTitle}>Sohbet Geçmişi</Text>
          <FlatList
            data={getGroupedDates()}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.drawerDateItem, selectedDate === item && styles.drawerDateItemActive]}
                onPress={() => selectDate(item)}
              >
                <Text style={[styles.drawerDateText, selectedDate === item && styles.drawerDateTextActive]}>
                  {formatDateLabel(item)}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.drawerListContent}
          />
        </LinearGradient>
      </Animated.View>

      <LinearGradient colors={Gradients.background} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Text style={styles.menuIconText}>☰</Text>
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>💜</Text>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Hatır Gönül</Text>
              <Text style={styles.headerSubtitle}>
                {selectedDate === new Date().toDateString() 
                  ? (isTyping ? 'Yazıyor...' : 'Çevrimiçi') 
                  : (selectedDate)}
              </Text>
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {phase === 'mood' ? (
            <View style={styles.moodPhase}>
              <View style={styles.greetingCard}>
                <LinearGradient
                  colors={['rgba(108,92,231,0.2)', 'rgba(162,155,254,0.1)']}
                  style={styles.greetingGradient}
                >
                  <Text style={styles.greetingEmoji}>🌟</Text>
                  <Text style={styles.greetingTitle}>
                    Hoş geldin{userName ? `, ${userName}` : ''}!
                  </Text>
                  <Text style={styles.greetingSubtitle}>
                    Bugün nasıl hissediyorsun? Birlikte konuşalım.
                  </Text>
                </LinearGradient>
              </View>
              <MoodSelector onSelect={handleMoodSelect} selectedScore={selectedMood} />
            </View>
          ) : (
            <>
              {messages.length === 0 && selectedDate !== new Date().toDateString() && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Bu gün için sohbet kaydı bulunmamaktadır.</Text>
                </View>
              )}
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                onContentSizeChange={scrollToBottom}
              />

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={`Bir şeyler yaz...`}
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    maxLength={500}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isTyping}
                  >
                    {isTyping ? (
                      <ActivityIndicator size="small" color={Colors.textPrimary} />
                    ) : (
                      <Text style={styles.sendIcon}>➤</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgDark },
  gradient: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    backgroundColor: 'rgba(15,15,30,0.8)',
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuButton: { padding: 4 },
  menuIconText: { fontSize: 24, color: Colors.textPrimary },
  avatarContainer: { position: 'relative' },
  avatarText: { fontSize: 24 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
    borderRadius: 5, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.bgDark,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: Colors.textMuted, fontSize: 12 },
  
  // Drawer Styles
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 50,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    zIndex: 100,
    elevation: 10,
  },
  drawerGradient: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: Colors.glassBorder,
    paddingTop: 40,
  },
  drawerHeaderTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    marginBottom: Spacing.sm,
  },
  drawerListContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  drawerDateItem: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
  },
  drawerDateItemActive: {
    backgroundColor: 'rgba(108,92,231,0.2)',
  },
  drawerDateText: { color: Colors.textSecondary, fontSize: 15 },
  drawerDateTextActive: { color: Colors.primaryLight, fontWeight: '600' },

  moodPhase: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.md, paddingBottom: 40 },
  greetingCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.glassBorder },
  greetingGradient: { padding: Spacing.xl, alignItems: 'center' },
  greetingEmoji: { fontSize: 48, marginBottom: Spacing.md },
  greetingTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
  greetingSubtitle: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  messageList: { paddingTop: Spacing.md, paddingBottom: Spacing.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: Colors.textMuted, fontSize: 16, textAlign: 'center' },
  inputWrapper: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.glassBorder, backgroundColor: 'rgba(15,15,30,0.9)' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.bgInput, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.glassBorder, paddingLeft: Spacing.md, paddingRight: Spacing.xs, paddingVertical: Spacing.xs },
  textInput: { flex: 1, color: Colors.textPrimary, fontSize: 15, maxHeight: 100, paddingVertical: Spacing.sm, lineHeight: 20 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.xs, marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: Colors.bgCardLight },
  sendIcon: { color: Colors.textPrimary, fontSize: 16, marginLeft: 2 },
});
