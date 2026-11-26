import React, { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Chip, Header, Icon, Logo, Screen } from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { wait } from '@/services';
import {
  fontSize,
  gradients,
  linear,
  radius,
  spacing,
  typography,
  useTheme,
} from '@/theme';
import { uid } from '@/utils/id';

interface Msg {
  id: string;
  from: 'me' | 'bot';
  text: string;
}

/** Dummy support chat UI (AC-05). */
export function ChatSupportScreen(_: RootScreenProps<'ChatSupport'>) {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'w', from: 'bot', text: t.help.chatWelcome },
  ]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const list = useRef<FlatList<Msg>>(null);

  const send = async (msg: string) => {
    const body = msg.trim();
    if (!body) return;
    setText('');
    setMessages(m => [...m, { id: uid(), from: 'me', text: body }]);
    setTyping(true);
    await wait(1200);
    setTyping(false);
    setMessages(m => [
      ...m,
      { id: uid(), from: 'bot', text: t.help.chatAutoReply },
    ]);
  };

  return (
    <Screen
      keyboard
      edges={['top', 'bottom']}
      header={
        <Header
          title={t.help.chatTitle}
          subtitle={typing ? 'typing…' : 'Online'}
        />
      }
    >
      <FlatList
        ref={list}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          list.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View style={[styles.msgRow, item.from === 'me' && styles.mine]}>
            {item.from === 'bot' ? <Logo size={28} /> : null}
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor:
                    item.from === 'me' ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText
                variant="bodySm"
                color={item.from === 'me' ? colors.textOnPrimary : 'text'}
              >
                {item.text}
              </AppText>
            </View>
          </View>
        )}
      />
      <View style={styles.quick}>
        {t.help.chatQuick.map(q => (
          <Chip key={q} label={q} onPress={() => send(q)} />
        ))}
      </View>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t.help.chatPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.surfaceAlt },
          ]}
          onSubmitEditing={() => send(text)}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => send(text)}
          style={[styles.send, linear(gradients.brand, 135)]}
          accessibilityRole="button"
          accessibilityLabel="Send"
        >
          <Icon name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '85%',
  },
  mine: { alignSelf: 'flex-end' },
  bubble: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 1,
  },
  quick: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    fontFamily: typography.body.fontFamily,
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
