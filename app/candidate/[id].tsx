import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, SafeAreaView, Text, View } from 'react-native';
import { getDeviceId } from '../../lib/device-id';
import { supabase } from '../../lib/supabase';

type Candidate = {
  id: string;
  name: string;
  waist_number: number | null;
  gender: string;
  university_id: string;
  height_cm: number | null;
  birthday: string | null; // ISO string from Postgres
  hobby: string | null;
  image_url: string | null;
};

type Category = {
  id: string;
  type: string;
  gender: string;
};

export default function CandidateDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ticketsLeft, setTicketsLeft] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, waist_number, gender, university_id, height_cm, birthday, hobby, image_url')
        .eq('id', id as string)
        .limit(1)
        .single();

      if (error) {
        setError(error.message);
        setCandidate(null);
      } else {
        setCandidate(data as Candidate);
        
        // Fetch available categories for this candidate's university and gender
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, type, gender')
          .eq('university_id', data.university_id)
          .ilike('gender', data.gender)
          .eq('is_active', true);
        if (categoriesError) {
          setError(categoriesError.message);
          setCategories([]);
        } else {
          setCategories(categoriesData ?? []);
        }
      }

      setLoading(false);
    })();
  }, [id]);

  // Replace direct vote with: open modal and fetch tickets left
  async function handleVoteButtonPress() {
    if (!candidate || categories.length === 0) {
      setError('No voting categories available for this candidate.');
      return;
    }
    setError(null);
  
    try {
      const deviceId = await getDeviceId();
      const { data, error } = await supabase.rpc('get_device_ticket_usage', {
        univ_id: candidate.university_id,
        device_id: deviceId,
      });
  
      if (error) throw error;
  
      const genderKey = candidate.gender.toLowerCase();
      const row = Array.isArray(data)
          ? (data as any[]).find((r) => String(r.gender).toLowerCase() === genderKey)
          : null;
  
      setTicketsLeft(row ? row.remaining_tickets : 0);
      setSelectedCategory(null);
      setShowCategoryModal(true);
    } catch (e: any) {
      setError(e.message ?? 'Unable to load ticket info.');
    }
  }

  async function submitVote() {
    if (!candidate || !selectedCategory) return;
    setVoting(true);
    setError(null);

    try {
      const deviceId = await getDeviceId();

      const { error: voteErr } = await supabase
        .from('votes')
        .insert({
          university_id: candidate.university_id,
          category_id: selectedCategory,
          candidate_id: candidate.id,
          device_id: deviceId,
        });

      if (voteErr) {
        throw voteErr;
      }

      setShowCategoryModal(false);
      Alert.alert('Vote submitted', 'Thank you for your vote!');
    } catch (e: any) {
      setError(e.message ?? 'Unable to cast vote.');
    } finally {
      setVoting(false);
    }
  }

  function getCategoryDisplayName(type: string): string {
    // Feel free to rename 'popular' to 'Smart' for UI:
    switch (type) {
      case 'king': return candidate?.gender.toLowerCase() === 'male' ? 'King' : 'Queen';
      case 'style': return candidate?.gender.toLowerCase() === 'male' ? 'Style' : 'Style';
      case 'popular': return 'Smart'; // UI label; DB type stays 'popular'
      case 'innocent': return 'Innocent';
      default: return type;
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!candidate) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Candidate not found</Text>
        {error && <Text style={{ marginTop: 8, color: 'red' }}>{error}</Text>}
      </SafeAreaView>
    );
  }

  async function findNeighbor(direction: 'next' | 'prev') {
    if (!candidate || candidate.waist_number == null) return null;

    const isNext = direction === 'next';
    const { data, error } = await supabase
      .from('candidates')
      .select('id, waist_number')
      .eq('university_id', candidate.university_id)
      .ilike('gender', candidate.gender)
      .eq('is_active', true)
      [isNext ? 'gt' : 'lt']('waist_number', candidate.waist_number)
      .order('waist_number', { ascending: isNext })
      .limit(1);

    if (error) return null;
    const row = Array.isArray(data) ? data[0] : null;
    return row?.id ?? null;
  }

  async function goPrev() {
    const prevId = await findNeighbor('prev');
    if (prevId) {
      router.push(`/candidate/${prevId}`);
    } else {
      Alert.alert('No previous candidate', 'You are at the first candidate.');
    }
  }

  async function goNext() {
    const nextId = await findNeighbor('next');
    if (nextId) {
      router.push(`/candidate/${nextId}`);
    } else {
      Alert.alert('No next candidate', 'You are at the last candidate.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#6a5acd' }}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 16,
            position: 'relative',
          }}
        >
          {candidate.image_url ? (
            <Image
              source={{ uri: candidate.image_url }}
              style={{ width: '100%', height: 220 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 220, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#666' }}>No photo</Text>
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.9)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontWeight: '700' }}>{candidate.waist_number ?? '—'}</Text>
          </View>

          {/* Full image button [ ] */}
          <Pressable
            onPress={() => candidate.image_url && setImageExpanded(true)}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              opacity: candidate.image_url ? 1 : 0.6,
            }}
          >
            <Text style={{ fontWeight: '700' }}>[ ]</Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', marginBottom: 16 }}>
          {candidate.name}
        </Text>

        {/* Birthday now formats to dd/mm/yyyy if present */}
        <InfoRow label="Height" value={candidate.height_cm ? `${candidate.height_cm} cm` : '—'} />
        <InfoRow label="Birthday" value={candidate.birthday ? formatDate(candidate.birthday) : '—'} />
        {candidate.birthday && (
          <InfoRow label="Age" value={`${computeAge(candidate.birthday)} years`} />
        )}
        <InfoRow label="Hobby" value={candidate.hobby || '—'} />

        {error && <Text style={{ marginTop: 12, color: '#ffdddd' }}>{error}</Text>}

        {/* Bottom controls: ← Vote → */}
        <View style={{ flexDirection: 'row', marginTop: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            onPress={goPrev}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>{'<'}</Text>
          </Pressable>

          <Pressable
            onPress={handleVoteButtonPress}
            disabled={voting}
            style={{
              backgroundColor: '#4f8cff',
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 28,
              opacity: voting ? 0.7 : 1,
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
              Vote
            </Text>
          </Pressable>

          <Pressable
            onPress={goNext}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>{'>'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Full-screen image overlay */}
      {imageExpanded && candidate.image_url && (
        <Pressable
          onPress={() => setImageExpanded(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.92)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={{ uri: candidate.image_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </Pressable>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onPress={() => setShowCategoryModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 10,
            }}
            onPress={(e) => e.stopPropagation()} // Prevent modal from closing when tapping inside
          >
            <Text style={{ fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 }}>
              Select Category
            </Text>
            <Text style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>
              Tickets left: {ticketsLeft ?? '...'}
            </Text>
            
            {/* Category grid (2x2) */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  disabled={(ticketsLeft ?? 0) <= 0}
                  style={{
                    width: '48%',
                    backgroundColor: selectedCategory === category.id ? '#e0f0ff' : '#f5f5f5',
                    paddingVertical: 14,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: selectedCategory === category.id ? '#4f8cff' : '#f5f5f5',
                    opacity: (ticketsLeft ?? 0) <= 0 ? 0.6 : 1,
                  }}
                >
                  <Text style={{
                    color: selectedCategory === category.id ? '#005fcc' : '#333',
                    fontSize: 15,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    {getCategoryDisplayName(category.type)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {error && (
              <Text style={{ color: 'red', fontSize: 14, textAlign: 'center', marginTop: 12, marginBottom: 4 }}>
                {error}
              </Text>
            )}

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
              <Pressable
                onPress={submitVote}
                disabled={!selectedCategory || voting || (ticketsLeft ?? 0) <= 0}
                style={{
                  flex: 1,
                  backgroundColor: selectedCategory && !voting && (ticketsLeft ?? 0) > 0 ? '#4f8cff' : '#ccc',
                  paddingVertical: 14,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                  {voting ? 'Voting...' : 'Vote'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowCategoryModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#f5f5f5',
                  paddingVertical: 14,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: '#666', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: 'white', opacity: 0.8 }}>{label}</Text>
      <Text style={{ color: 'white', fontWeight: '600', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function computeAge(iso: string) {
  try {
    let y = 0, m = 0, d = 0;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [yy, mm, dd] = iso.split('-').map((v) => parseInt(v, 10));
      y = yy; m = mm; d = dd;
    } else {
      const dt = new Date(iso);
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    }

    const birthUTC = new Date(Date.UTC(y, m - 1, d));
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    let age = todayUTC.getUTCFullYear() - birthUTC.getUTCFullYear();
    const beforeBirthday =
      todayUTC.getUTCMonth() < birthUTC.getUTCMonth() ||
      (todayUTC.getUTCMonth() === birthUTC.getUTCMonth() && todayUTC.getUTCDate() < birthUTC.getUTCDate());

    if (beforeBirthday) age -= 1;
    return Math.max(age, 0);
  } catch {
    return 0;
  }
}

function formatDate(iso: string) {
  try {
    let y = 0, m = 0, d = 0;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [yy, mm, dd] = iso.split('-').map((v) => parseInt(v, 10));
      y = yy; m = mm; d = dd;
    } else {
      const dt = new Date(iso);
      y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
    }
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = String(d).padStart(2, '0');
    const mon = months[m - 1] ?? String(m).padStart(2, '0');
    return `${day} ${mon} ${y}`;
  } catch {
    return iso;
  }
}