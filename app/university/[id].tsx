import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Candidate = {
  id: string;
  name: string;
  waist_number: number | null;
  gender: string;
  university_id: string;
  image_url: string | null;
};

export default function UniversityCandidates() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const universityName = useMemo(() => (typeof name === 'string' ? name : ''), [name]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data: cand, error: candErr } = await supabase
        .from('candidates')
        .select('id, name, waist_number, gender, university_id, image_url')
        .eq('university_id', id as string)
        .ilike('gender', gender)
        .eq('is_active', true)
        .order('waist_number', { ascending: true });

      if (candErr) {
        setError(candErr.message);
        setCandidates([]);
      } else {
        setCandidates(cand ?? []);
      }
      setLoading(false);
    })();
  }, [id, gender]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#6a5acd' }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: 'white', letterSpacing: 0.3 }}>
          Choose Candidate
        </Text>
        <Text style={{ marginTop: 6, color: 'rgba(255,255,255,0.95)', fontSize: 15 }}>
          {universityName ? `University: ${universityName}` : 'Select a person to view details'}
        </Text>

        {/* Gender tabs */}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <Pressable
            onPress={() => setGender('Male')}
            style={{
              flex: 1,
              backgroundColor: gender === 'Male' ? '#4f8cff' : 'rgba(255,255,255,0.25)',
              paddingVertical: 12,
              borderRadius: 12,
              marginRight: 8,
            }}
          >
            <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Male</Text>
          </Pressable>
          <Pressable
            onPress={() => setGender('Female')}
            style={{
              flex: 1,
              backgroundColor: gender === 'Female' ? '#4f8cff' : 'rgba(255,255,255,0.25)',
              paddingVertical: 12,
              borderRadius: 12,
              marginLeft: 8,
            }}
          >
            <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Female</Text>
          </Pressable>
        </View>

        {/* List */}
        <View style={{ flex: 1, marginTop: 16 }}>
          {loading && (
            <View style={{ marginTop: 24 }}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
          {error && <Text style={{ marginTop: 12, color: '#ffdddd' }}>{error}</Text>}
          {!loading && !error && (
            <FlatList
              data={candidates}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    {
                      backgroundColor: 'white',
                      borderRadius: 18,
                      paddingVertical: 14,
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
                  onPress={() => {
                    router.push({
                      pathname: '/candidate/[id]',
                      params: { id: item.id },
                    });
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                    {/* Avatar */}
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
                      />
                    ) : (
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
                        <Text style={{ fontSize: 22 }}>👤</Text>
                      </View>
                    )}

                    {/* Name + Waist number */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: '#222' }}>{item.name}</Text>
                      {/* {item.waist_number != null && (
                        <Text style={{ marginTop: 4, color: '#6b7280' }}>No. {item.waist_number}</Text>
                      )} */}
                    </View>
                  </View>

                  {/* Right-side number pill */}
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
                    <Text style={{ fontSize: 16, color: '#333' }}>
                      {item.waist_number ?? '—'}
                    </Text>
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