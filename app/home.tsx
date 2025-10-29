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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#6a5acd' /* soft purple */ }}>
        <Text style={{ fontSize: 34, fontWeight: '800', color: 'white', letterSpacing: 0.3 }}>
          👑 King & Queen Voting
        </Text>
        <Text style={{ marginTop: 10, color: 'rgba(255,255,255,0.95)', fontSize: 16 }}>
          Choose your university to start voting
        </Text>

        <View style={{ marginTop: 20, backgroundColor: 'transparent', flex: 1 }}>
          {loading && (
            <View style={{ marginTop: 24 }}>
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
                      backgroundColor: 'white',
                      borderRadius: 18,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      marginBottom: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.06)',
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
                      <Text style={{ fontSize: 20, fontWeight: '700', color: '#222' }}>
                        {item.name}
                      </Text>
                      <Text style={{ marginTop: 4, color: '#6b7280' }}>
                        Tap to start voting
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f2f2f7',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18, color: '#666' }}>→</Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}