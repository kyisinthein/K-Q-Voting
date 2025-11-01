import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

type University = {
  id: string;
  name: string;
};

export default function Home() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Supabase URL present?', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key present?', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) {
        setError(error.message);
      } else {
        setUniversities(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const openUniversity = (u: University) => {
    router.push({ pathname: '/university/[id]', params: { id: u.id, name: u.name } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LinearGradient
        colors={['#538df8ff', '#5B3DB5', '#5B3DB5']} // top→middle→bottom
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 20, backgroundColor: 'transparent', marginTop: 60 }}>
          <Text style={{ alignSelf: 'center', fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: 0.3 }}>
            King & Queen Voting
          </Text>
          <Text style={{ alignSelf: 'center', marginTop: 10, color: 'rgba(255, 200, 0, 1)', fontSize: 13 }}>
            Choose your university to start voting
          </Text>
          <View style={{ marginTop: 20, backgroundColor: 'transparent', flex: 1 }}>
            {loading && (
              <View style={{ marginTop: 200 }}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            {error && (
              <Text style={{ marginTop: 16, color: '#ffdddd' }}>
                {error}
              </Text>
            )}
            {!loading && !error && (
              <FlatList
                data={universities}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => openUniversity(item)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderRadius: 40,
                        paddingVertical: 20,
                        paddingHorizontal: 25,
                        marginBottom: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 6 },
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: '#fff5db',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>🎓</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: '400', color: 'rgba(235, 236, 249, 1)' }}>
                          {item.name}
                        </Text>
                        <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)' }}>
                          Tap to start voting
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,1)" />
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}