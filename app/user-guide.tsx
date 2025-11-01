import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import BackButton from '../components/ui/back-button';
export default function UserGuide() {
  const sections = [
    {
      title: 'Getting Started',
      points: [
        'Choose your university from the list.',
        'Browse categories: King, Queen, Style, Popular, Innocent.',
        'Open a candidate to view details and vote.',
      ],
    },
    {
      title: 'Voting',
      points: [
        'Tap “Vote” on a candidate detail.',
        'Each vote updates live results instantly.',
        'Return to the list to explore other candidates.',
      ],
    },
    {
      title: 'Live Results',
      points: [
        'Open “Live Results” from Quick Actions.',
        'Use the university chips to switch views.',
        'See top-ranked candidates per category in real time.',
      ],
    },
    {
      title: 'Account & Privacy',
      points: [
        'No personal data is displayed publicly.',
        'Images and names are shown per candidate record.',
        'Contact admins for data updates or removals.',
      ],
    },
    {
      title: 'Tips',
      points: [
        'Use stable internet for faster updates.',
        'Refresh the page if results seem stale.',
        'Try different categories to discover more candidates.',
      ],
    },
    {
      title: 'FAQs',
      points: [
        'Votes are counted per candidate and category.',
        'Inactive universities won’t show live categories.',
        'Admin can export aggregate CSVs when needed.',
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9587f0ff' }}>
      
      <BackButton
        color="white"
        style={{ top: 70, left: 16, zIndex: 20, elevation: 3 }}
      />
      <View style={{ flex: 1, backgroundColor: '#8878f0ff' }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32, marginTop: 55 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center', letterSpacing: 0.3 }}>
              User Guide
            </Text>
            <Text style={{ marginTop: 6, color: 'white', opacity: 0.9, textAlign: 'center' }}>
              Everything you need to use K-Q Voting
            </Text>
          </View>

          {/* Sections */}
          <View style={{ rowGap: 14 }}>
            {sections.map((s) => (
              <View
                key={s.title}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.06)',
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#222', textAlign: 'center' }}>{s.title}</Text>
                <View style={{ marginTop: 8, rowGap: 6 }}>
                  {s.points.map((p, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Text style={{ color: '#6a5acd', fontSize: 16, marginRight: 8 }}>•</Text>
                      <Text style={{ color: '#333', fontSize: 15, flex: 1 }}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Footer actions */}
          {/* <View style={{ marginTop: 20, alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                columnGap: 12,
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
                padding: 8,
              }}
            >
              <Pressable
                onPress={() => router.push('/')}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  minWidth: 120,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#222', fontWeight: '700' }}>Home</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/live-results')}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  backgroundColor: 'transparent',
                  minWidth: 120,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Live Results</Text>
              </Pressable>
            </View>
          </View> */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}