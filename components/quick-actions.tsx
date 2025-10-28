import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';

export default function QuickActionsFloating() {
  const [open, setOpen] = useState(false);

  function goHome() {
    setOpen(false);
    router.push('/');
  }

  function comingSoon(label: string) {
    setOpen(false);
    Alert.alert(`${label}`, 'This page is coming soon.');
  }

  return (
    <>
      {/* Right-edge floating pill */}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
        <View pointerEvents="box-none" style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
          <Pressable
            onPress={() => setOpen(true)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'white',
              position: 'relative',
              right: -12,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700' }}>{'<<'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Popup modal with 6 actions */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 16,
              width: '100%',
              maxWidth: 300,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }}>Quick Actions</Text>

            <View style={{ marginTop: 12, rowGap: 10 }}>
              <View style={{ flexDirection: 'row', columnGap: 10 }}>
                <ActionTile icon="house.fill" label="Home" onPress={goHome} />
                <ActionTile icon="list.bullet" label="List" onPress={() => comingSoon('List')} />
              </View>
              <View style={{ flexDirection: 'row', columnGap: 10 }}>
                <ActionTile icon="book.fill" label="User Guide" onPress={() => comingSoon('User Guide')} />
                <ActionTile icon="envelope.fill" label="Messages" onPress={() => comingSoon('Messages')} />
              </View>
              <View style={{ flexDirection: 'row', columnGap: 10 }}>
                <ActionTile icon="chart.bar.fill" label="Live Results" onPress={() => { setOpen(false); router.push('/live-results'); }} />
                <ActionTile icon="info.circle.fill" label="About us" onPress={() => comingSoon('About us')} />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Pressable onPress={() => setOpen(false)} style={{ backgroundColor: '#f5f5f5', paddingVertical: 12, borderRadius: 12 }}>
                <Text style={{ textAlign: 'center', color: '#333', fontWeight: '600' }}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ActionTile({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: '#f7f7f8',
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <IconSymbol name={icon as any} size={22} color="#333" />
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#333', marginTop: 6 }}>{label}</Text>
    </Pressable>
  );
}