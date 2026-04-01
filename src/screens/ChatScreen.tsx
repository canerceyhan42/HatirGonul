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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Message, sendMessageToGemini, analyzeMood } from '../services/GeminiService';
import { saveChatHistory, getChatHistory, saveMoodEntry, getUserName } from '../services/StorageService';
import { ChatBubble } from '../components/ChatBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { MoodSelector } from '../components/MoodSelector';
import { Colors, Gradients, Spacing, BorderRadius } from '../theme/colors';

type ChatPhase = 'mood' | 'chat';

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>('mood');
  const [selectedMood, setSelectedMood] = useState<number | undefined>();
  const [userName, setUserName] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [history, name] = await Promise.all([getChatHistory(), getUserName()]);
    setUserName(name);
    if (history.length > 0) {
      setMessages(history);
      setPhase('chat');
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleMoodSelect = async (score: number, emoji: string, label: string) => {
    setSelectedMood(score);

    // Save mood entry
    await saveMoodEntry({
      id: Date.now().toString(),
      score,
      emoji,
      label,
      date: new Date().toISOString(),
    });

    // Get AI greeting based on mood
    setIsTyping(true);
    setPhase('chat');

    try {
      const greeting = await analyzeMood(score);
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: greeting,
        timestamp: new Date(),
      };
      setMessages([aiMessage]);
      await saveChatHistory([aiMessage]);
    } catch (e) {
      const fallback: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: `${emoji} durumunu gördüm. Seninle konuşmaktan mutluluk duyuyorum 💜 Nasıl yardımcı olabilirim?`,
        timestamp: new Date(),
      };
      setMessages([fallback]);
    } finally {
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
      const response = await sendMessageToGemini(messages, text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
      scrollToBottom();
    } catch (error: any) {
      const errMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Üzgünüm, şu an bağlanamadım. Biraz sonra tekrar dener misin? 🙏',
        timestamp: new Date(),
      };
      setMessages([...newMessages, errMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <ChatBubble message={item} />
  );

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDark} />
      <LinearGradient
        colors={Gradients.background}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>💜</Text>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Hatır Gönül</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping ? 'Yazıyor...' : 'Çevrimiçi'}
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
            /* Mood Selection Phase */
            <View style={styles.moodPhase}>
              <View style={styles.greetingCard}>
                <LinearGradient
                  colors={['rgba(108,92,231,0.2)', 'rgba(162,155,254,0.1)']}
                  style={styles.greetingGradient}
                >
                  <Text style={styles.greetingEmoji}>🌟</Text>
                  <Text style={styles.greetingTitle}>
                    {getTimeGreeting()}{userName ? `, ${userName}` : ''}!
                  </Text>
                  <Text style={styles.greetingSubtitle}>
                    Bugün nasıl hissediyorsun? Birlikte konuşalım.
                  </Text>
                </LinearGradient>
              </View>
              <MoodSelector onSelect={handleMoodSelect} selectedScore={selectedMood} />
            </View>
          ) : (
            /* Chat Phase */
            <>
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

              {/* Input Area */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Bir şeyler yaz..."
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    backgroundColor: 'rgba(15,15,30,0.8)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.bgDark,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  moodPhase: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
  },
  greetingCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  greetingGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  greetingEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  greetingTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  greetingSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageList: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  inputWrapper: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    backgroundColor: 'rgba(15,15,30,0.9)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.bgCardLight,
  },
  sendIcon: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginLeft: 2,
  },
});
