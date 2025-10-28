import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

type University = { id: string; name: string };
type Category = { id: string; university_id: string; gender: string; type: string };
type TopRow = { category_id: string; candidate_id: string; votes: number };
type Candidate = { id: string; name: string; image_url?: string | null; gender: string };

function formatNumber(n: number | null | undefined) {
  try {
    return (n ?? 0).toLocaleString();
  } catch {
    return String(n ?? 0);
  }
}

function getCategoryLabel(gender: string, type: string): string {
  const g = gender.toLowerCase();
  const t = type.toLowerCase();
  if (t === 'king') return g === 'female' ? 'Queen' : 'King';
  if (t === 'style') return 'Style';
  if (t === 'popular') return 'Smart';
  if (t === 'innocent') return 'Innocent';
  return type;
}

export default function LiveResults() {
  const params = useLocalSearchParams<{ university_id?: string }>();
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(typeof params.university_id === 'string' ? params.university_id : null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topRows, setTopRows] = useState<TopRow[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedUniversityName = useMemo(() => {
    const found = universities.find(u => u.id === selectedUniversityId);
    return found?.name ?? '';
  }, [universities, selectedUniversityId]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure we have a university selected
        if (!selectedUniversityId) {
          const { data: unis, error: uniErr } = await supabase
            .from('universities')
            .select('id, name')
            .eq('is_active', true)
            .order('name', { ascending: true });
          if (uniErr) throw new Error(uniErr.message);
          setUniversities(unis ?? []);
          const first = (unis ?? [])[0]?.id ?? null;
          setSelectedUniversityId(first);
          if (!first) {
            setCategories([]);
            setTopRows([]);
            setCandidates({});
            setLoading(false);
            return;
          }
        } else {
          // Load universities for display
          if (universities.length === 0) {
            const { data: unis, error: uniErr } = await supabase
              .from('universities')
              .select('id, name')
              .eq('is_active', true)
              .order('name', { ascending: true });
            if (uniErr) throw new Error(uniErr.message);
            setUniversities(unis ?? []);
          }
        }

        const univId = selectedUniversityId!;
        // Fetch active categories for this university
        const { data: cats, error: catErr } = await supabase
          .from('categories')
          .select('id, university_id, gender, type')
          .eq('university_id', univId)
          .eq('is_active', true);
        if (catErr) throw new Error(catErr.message);
        setCategories(cats ?? []);
        const catIds = (cats ?? []).map(c => c.id);

        if (catIds.length === 0) {
          setTopRows([]);
          setCandidates({});
          setLoading(false);
          return;
        }

        // Fetch top result per category from the public view
        const { data: tops, error: topErr } = await supabase
          .from('public_top_results')
          .select('category_id, candidate_id, votes')
          .in('category_id', catIds);
        if (topErr) throw new Error(topErr.message);
        setTopRows(tops ?? []);

        const candIds = Array.from(new Set((tops ?? []).map(t => t.candidate_id)));
        let candMap: Record<string, Candidate> = {};
        if (candIds.length > 0) {
          const { data: cands, error: candErr } = await supabase
            .from('candidates')
            .select('id, name, image_url, gender')
            .in('id', candIds);
          if (candErr) throw new Error(candErr.message);
          for (const c of cands ?? []) candMap[c.id] = c;
        }
        setCandidates(candMap);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load live results');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedUniversityId]);

  // Order categories in a friendly, predictable layout
  const orderedCategories = useMemo(() => {
    const order: Array<{ gender: 'male' | 'female'; type: string }> = [
      { gender: 'male', type: 'king' },
      { gender: 'female', type: 'king' },
      { gender: 'male', type: 'style' },
      { gender: 'female', type: 'style' },
      { gender: 'male', type: 'popular' },
      { gender: 'female', type: 'popular' },
      { gender: 'male', type: 'innocent' },
      { gender: 'female', type: 'innocent' },
    ];
    const byKey = new Map(categories.map(c => [`${c.gender}:${c.type}`, c] as const));
    return order.map(o => byKey.get(`${o.gender}:${o.type}`)).filter(Boolean) as Category[];
  }, [categories]);

  const topsByCategoryId = useMemo(() => {
    const map = new Map<string, TopRow>();
    for (const t of topRows) map.set(t.category_id, t);
    return map;
  }, [topRows]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#6a5acd' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>Live Results</Text>
        <Text style={{ marginTop: 6, color: 'white', opacity: 0.9 }}>
          {selectedUniversityName ? `University: ${selectedUniversityName}` : 'Choose a university to view results'}
        </Text>

        {/* University quick selector (compact) */}
        {universities.length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 12, columnGap: 8, flexWrap: 'wrap' }}>
            {universities.slice(0, 6).map(u => (
              <Pressable
                key={u.id}
                onPress={() => setSelectedUniversityId(u.id)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: selectedUniversityId === u.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                }}
              >
                <Text style={{ color: '#222', fontWeight: '600' }}>{u.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ flex: 1, marginTop: 16 }}>
          {loading && (
            <View style={{ marginTop: 24 }}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
          {error && <Text style={{ marginTop: 12, color: '#ffdddd' }}>{error}</Text>}

          {!loading && !error && orderedCategories.length > 0 && (
            <FlatList
              data={orderedCategories}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ rowGap: 14, paddingBottom: 24 }}
              renderItem={({ item }) => {
                const top = topsByCategoryId.get(item.id);
                const cand = top ? candidates[top.candidate_id] : undefined;

                return (
                  <View>
                    <Text style={{ color: 'white', marginBottom: 8, fontWeight: '600' }}>
                      {getCategoryLabel(item.gender, item.type)} Top value result
                    </Text>

                    {/* Pill */}
                    <View
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 24,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: '#e6e6e6',
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#eef2ff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            borderWidth: 1,
                            borderColor: '#d5dbff',
                          }}
                        >
                          {cand?.image_url ? (
                            <Image
                              source={{ uri: cand.image_url }}
                              style={{ width: 40, height: 40, borderRadius: 20 }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={{ fontSize: 18, color: '#333' }}>👤</Text>
                          )}
                        </View>
                        <View>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#222' }}>
                            {cand?.name ?? 'No votes yet'}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                            {item.gender.toLowerCase() === 'female' ? 'Female' : 'Male'}
                          </Text>
                        </View>
                      </View>

                      <View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#222' }}>
                          {formatNumber(top?.votes ?? 0)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {!loading && !error && orderedCategories.length === 0 && (
            <Text style={{ color: 'white', opacity: 0.9 }}>
              No active categories for the selected university.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}