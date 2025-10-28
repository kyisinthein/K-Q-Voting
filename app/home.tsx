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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#6a5acd' /* soft purple */ }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: 'white' }}>
          👑 King & Queen Voting
        </Text>
        <Text style={{ marginTop: 8, color: 'white', opacity: 0.9 }}>
          Choose your university to start voting
        </Text>

        <View style={{ marginTop: 16, backgroundColor: 'transparent', flex: 1 }}>
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
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, marginRight: 10 }}>🎓</Text>
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: '600', color: '#222' }}>
                        {item.name}
                      </Text>
                      <Text style={{ marginTop: 2, color: '#666' }}>
                        Tap to start voting
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 20, color: '#666' }}>→</Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}