import { Text, View } from 'react-native';

import { Card, GhostButton, Muted, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, space } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <Screen style={{ gap: space.lg }}>
      <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: space.md,
          }}
        >
          <Text style={{ color: colors.paper, fontSize: 24, fontWeight: '700' }}>{initials || 'U'}</Text>
        </View>
        <Text style={{ color: colors.ink, fontSize: 24, fontWeight: '700' }}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Muted style={{ marginTop: 4 }}>{user?.email}</Muted>
      </Card>
      <GhostButton danger label="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}
