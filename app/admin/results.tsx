import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Row = {
  university_id: string;
  category_id: string;
  gender: string;
  type: string;
  candidate_id: string;
  waist_number: number | null;
  name: string;
  votes: number;
};

type CategoryGroup = {
  key: string; // gender-type
  label: string; // e.g., "Style — Male"
  candidates: Row[];
};

function getDisplayType(gender: string, type: string): string {
  const g = gender.toLowerCase();
  const t = type.toLowerCase();
  if (t === 'king') return g === 'female' ? 'Queen' : 'King';
  if (t === 'style') return 'Style';
  if (t === 'popular') return 'Popular';
  if (t === 'innocent') return 'Innocent';
  return type;
}

function getGenderLabel(gender: string): string {
  return gender?.toLowerCase() === 'female' ? 'Female' : 'Male';
}

export default function AdminResults() {
  const { university_id, pw } = useLocalSearchParams<{ university_id?: string; pw?: string }>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [universityName, setUniversityName] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!university_id || !pw) {
          setError('Missing university ID or password');
          setLoading(false);
          return;
        }

        const { data: univData, error: univErr } = await supabase
          .from('universities')
          .select('name')
          .eq('id', university_id)
          .single();
        if (!univErr && univData?.name) setUniversityName(univData.name);

        const { data, error } = await supabase.rpc('get_admin_full_results_secure', {
          univ_id: university_id,
          plain_password: pw,
        });
        if (error) throw error;

        setRows((data ?? []) as Row[]);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load admin results');
      } finally {
        setLoading(false);
      }
    })();
  }, [university_id, pw]);

  // Group rows by gender-type and sort within each group by votes desc
  const grouped: CategoryGroup[] = useMemo(() => {
    const buckets = new Map<string, Row[]>();
    for (const r of rows) {
      const key = `${r.gender.toLowerCase()}-${r.type.toLowerCase()}`;
      const cur = buckets.get(key) ?? [];
      cur.push(r);
      buckets.set(key, cur);
    }
    for (const [key, items] of buckets.entries()) {
      items.sort((a, b) => (b.votes - a.votes) || a.candidate_id.localeCompare(b.candidate_id));
      buckets.set(key, items);
    }
    const order: string[] = [
      'male-king',
      'female-king',
      'male-style',
      'female-style',
      'male-popular',
      'female-popular',
      'male-innocent',
      'female-innocent',
    ];
    const toGroup = (key: string, items: Row[]): CategoryGroup => {
      const [g, t] = key.split('-');
      return {
        key,
        label: `${getDisplayType(g, t)} — ${getGenderLabel(g)}`,
        candidates: items,
      };
    };
    // Produce ordered groups; include any unexpected keys at the end
    const ordered: CategoryGroup[] = [];
    for (const k of order) {
      const it = buckets.get(k);
      if (it && it.length > 0) ordered.push(toGroup(k, it));
    }
    for (const [k, it] of buckets.entries()) {
      if (!order.includes(k) && it.length > 0) ordered.push(toGroup(k, it));
    }
    return ordered;
  }, [rows]);

  const renderCandidateItem = ({ item, index }: { item: Row; index: number }) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.10)' : 'rgba(255, 255, 255, 0.06)',
          marginVertical: 2,
          borderRadius: 8,
          borderLeftWidth: index === 0 ? 4 : 0,
          borderLeftColor: '#FFD700',
        }}
      >
        <Text style={{ fontSize: 18, marginRight: 12, minWidth: 32 }}>
          {medal || `${index + 1}.`}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>{item.name}</Text>
          {item.waist_number && (
            <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)' }}>#{item.waist_number}</Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#4f8cff' }}>{item.votes}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' }}>votes</Text>
        </View>
      </View>
    );
  };

  const renderCategorySection = ({ item }: { item: CategoryGroup }) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: 'white', marginBottom: 12, paddingHorizontal: 16 }}>
        {item.label}
      </Text>
      {item.candidates.length === 0 ? (
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', paddingHorizontal: 16 }}>
          No candidates in this category
        </Text>
      ) : (
        <FlatList
          data={item.candidates}
          renderItem={renderCandidateItem}
          keyExtractor={(candidate) => candidate.candidate_id}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: 'white', marginTop: 16 }}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ffdddd', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <Pressable
            onPress={() => router.back()}
            style={{ backgroundColor: '#4f8cff', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6a5acd' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: '#4f8cff', fontSize: 16 }}>← Back to Dashboard</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>All Rankings</Text>
          <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 }}>{universityName}</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>
            Total votes: {rows.reduce((sum, row) => sum + row.votes, 0)} • {grouped.length} categories
          </Text>
        </View>

        {/* Results */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
          {grouped.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, textAlign: 'center' }}>
                No voting results available yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={grouped}
              renderItem={renderCategorySection}
              keyExtractor={(item) => item.key}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}