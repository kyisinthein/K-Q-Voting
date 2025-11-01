import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import BackButton from '../components/ui/back-button';
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
  if (t === 'popular') return 'Popular';
  if (t === 'innocent') return 'Innocent';
  return type;
}

export default function LiveResults() {
  // Normalize route param: treat 'null'/'undefined'/empty/non-UUID as null
  function normalizeUUID(u?: string | null): string | null {
    const s = (u ?? '').trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(s) ? s : null;
  }

  const params = useLocalSearchParams<{ university_id?: string }>();
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(
    normalizeUUID(typeof params.university_id === 'string' ? params.university_id : null)
  );
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

          // Exit now; next render will run with a valid id (or none).
          setLoading(false);
          return;
        } else {
          // Load universities for display if not already loaded
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

        // Guard: only query if we have a valid UUID
        const univId = selectedUniversityId;
        if (!univId) {
          setLoading(false);
          return;
        }

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

        // Fetch candidate display info
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
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <LinearGradient
              colors={['#538df8ff', '#5B3DB5', '#5B3DB5']} // top→middle→bottom
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            >
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
      <View style={{ flex: 1, padding: 20, backgroundColor: 'transparent', marginTop: 55 }}>
         
        <Text
          style={{
            fontSize: 26,
            fontWeight: '800',
            color: 'white',
            textAlign: 'center',
            letterSpacing: 0.3,
          }}
        >
          Live Results
        </Text>
        {/* <Text style={{ marginTop: 6, color: 'white', opacity: 0.9, textAlign: 'center' }}>
          {selectedUniversityName ? `University: ${selectedUniversityName}` : 'Choose a university to view results'}
        </Text> */}

        {/* University segmented control */}
        {universities.length > 0 && (
          <View style={{ marginTop: 20, alignSelf: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'rgba(255,255,255,0.16)',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
                padding: 6,
                columnGap: 6,
              }}
            >
              {universities.slice(0, 6).map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => setSelectedUniversityId(u.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 18,
                    backgroundColor: selectedUniversityId === u.id ? 'rgba(255,255,255,0.85)' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: selectedUniversityId === u.id ? '#222' : 'white',
                      fontWeight: '700',
                    }}
                  >
                    {u.name}
                  </Text>
                </Pressable>
              ))}
            </View>
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
              contentContainerStyle={{ rowGap: 16, paddingBottom: 24 }}
              renderItem={({ item }) => {
                const top = topsByCategoryId.get(item.id);
                const cand = top ? candidates[top.candidate_id] : undefined;

                return (
                  <View>
                    <Text style={{ color: 'white', marginBottom: 8, fontWeight: '600', opacity: 0.9 }}>
                      {getCategoryLabel(item.gender, item.type)} Top value result
                    </Text>

                    {/* Result card */}
                    <View
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderRadius: 30,
                        paddingVertical: 20,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        shadowOffset: { width: 0, height: 6 },
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
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
                              style={{ width: 44, height: 44, borderRadius: 22 }}
                              resizeMode="cover"
                              blurRadius={100} // strong blur for suspense
                            />
                          ) : (
                            <Text style={{ fontSize: 16, color: '#333', fontWeight: '700' }}>
                              {(cand?.name ?? '—').charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
                            {cand ? 'Who will it be?' : 'No votes yet'}
                          </Text>
                        </View>
                      </View>

                      {/* Vote count pill */}
                      <View
                        style={{
                          minWidth: 40,
                          height: 40,
                          paddingHorizontal: 12,
                          borderRadius: 20,
                          backgroundColor: 'rgba(255, 255, 255, 0.21)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.22)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 15, fontWeight: '400', color: '#ffffffff' }}>
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
      </LinearGradient>
    </SafeAreaView>
  );
}