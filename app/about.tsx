import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Linking, SafeAreaView, ScrollView, Text, View } from 'react-native';
import BackButton from '../components/ui/back-button';
export default function About() {
  const cards = [
    {
      title: '',
      body:
        '',
      icon: '',
    },
    // {
    //   title: 'What We Do',
    //   body:
    //     'We provide candidate profiles, live results, and admin tools to manage categories and export data safely.',
    //   icon: '',
    // },
    // {
    //   title: 'Values',
    //   body:
    //     'Privacy-first, inclusive design, and reliable performance across devices. We continuously polish the experience.',
    //   icon: '',
    // },
  ];

  function contactEmail() {
    Linking.openURL('mailto:kyisinthein6940@gamil.com?subject=K-Q%20Voting%20Support');
  }
  function contactPhone() {
    Linking.openURL('tel:+959694033156');
  }

  return (
    <>
      {/* Back button */}
      <BackButton
        color="white"
        style={{
          top: 70,
          left: 16,
          zIndex: 20,
          elevation: 3,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>

        <LinearGradient
                colors={['#6FB0FF', '#7E74F9', '#5B3DB5']} // top→middle→bottom
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1 }}
              >
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 12, marginTop: 55 }}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center', letterSpacing: 0.3 }}>
                About Us
              </Text>
              <Text style={{ marginTop: 20, color: 'white', opacity: 0.9, textAlign: 'center' }}>
                Learn more about the King/Queen Voting platform
              </Text>
            </View>
    
            {/* Cards */}
            <View style={{ rowGap: 14 }}>
              {cards.map((c) => (
                <View
                  key={c.title}
                  style={{
                    backgroundColor: 'transparent',
                    display: 'none',
                    borderRadius: 20,
                    paddingVertical: 1,
                    paddingHorizontal: 1,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.06)',
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    {/* <Text style={{ fontSize: 20, marginRight: 8, }}>{c.icon}</Text> */}
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#222', textAlign: 'center' }}>{c.title}</Text>
                  </View>
                  <Text style={{ color: '#333', fontSize: 15, lineHeight: 32, textAlign: 'justify' }}>{c.body}</Text>
                </View>
              ))}
            </View>
    
            {/* Team / Contact */}
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                paddingVertical: 25,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.06)',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                marginTop: 14,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#222', textAlign: 'center' }}>Get in Touch</Text>
              <Text style={{ color: '#333', fontSize: 15, marginTop: 15, textAlign: 'center' }}>
                Questions or feedback?
                
              </Text><Text style={{ color: '#333', fontSize: 15, marginTop: 15, textAlign: 'center' }}>
                
                 We’d love to hear from you.
              </Text>
              <View style={{ marginTop: 15, rowGap: 4 }}>
                <Text style={{ color: '#6a5acd', fontSize: 15, textAlign: 'center', fontWeight: '700', marginTop: 0 }}>Organization: Workify</Text>
                <Text style={{ color: '#333', fontSize: 14, textAlign: 'center', marginTop: 15 }}>Email: kyisinthein6940@gamil.com</Text>
                <Text style={{ color: '#333', fontSize: 14, textAlign: 'center', marginTop: 15 }}>Phone: +959694033156</Text>
                <Text style={{ color: '#333', fontSize: 14, textAlign: 'center', marginTop: 15 }}>🇲🇲 🇺🇸 🇹🇭</Text>
              </View>
             
            </View>
    
            {/* Footer navigation */}
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
                  onPress={() => router.push('/user-guide')}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    backgroundColor: 'transparent',
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>User Guide</Text>
                </Pressable>
              </View>
            </View> */}
          </ScrollView>
        </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}