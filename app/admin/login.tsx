import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type University = { id: string; name: string };

export default function AdminLogin() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) setError(error.message);
      setUniversities(data ?? []);
      setSelected((data ?? [])[0]?.id ?? null);
      setLoading(false);
    })();
  }, []);

  async function signIn() {
    if (!selected || !password) {
      setError('Please select a university and enter password.');
      return;
    }
    setVerifying(true);
    setError(null);
    const { data, error } = await supabase.rpc('admin_verify_password', {
      univ_id: selected,
      plain_password: password,
    });

    if (error) {
      setError(error.message);
      setVerifying(false);
      return;
    }
    if (!data) {
      setError('Invalid password.');
      setVerifying(false);
      return;
    }

    // Navigate to admin dashboard; pass password for secure RPC calls
    router.push({
      pathname: '/admin/dashboard',
      params: { university_id: selected, pw: password },
    });
    setVerifying(false);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: '#6a5acd' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>Admin Login</Text>
        <Text style={{ marginTop: 6, color: 'white', opacity: 0.9 }}>
          Select university and enter admin password
        </Text>

        <View style={{ marginTop: 16 }}>
          {loading && <ActivityIndicator color="#fff" />}
          {error && <Text style={{ marginTop: 8, color: '#ffdddd' }}>{error}</Text>}
          {!loading && (
            <>
              <Text style={{ color: 'white', marginBottom: 8 }}>University</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8 }}>
                {universities.map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => setSelected(u.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: selected === u.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    <Text style={{ color: '#222', fontWeight: '600' }}>{u.name}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={{ color: 'white', marginTop: 16, marginBottom: 8 }}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Admin password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                }}
              />

              <Pressable
                onPress={signIn}
                disabled={verifying}
                style={{
                  marginTop: 16,
                  backgroundColor: '#4f8cff',
                  paddingVertical: 12,
                  borderRadius: 12,
                  opacity: verifying ? 0.7 : 1,
                }}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontWeight: '700' }}>
                  {verifying ? 'Verifying…' : 'Sign in'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}