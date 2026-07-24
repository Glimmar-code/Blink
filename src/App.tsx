export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}
        >
          <span style={{ color: 'white', fontSize: 36, fontWeight: 800 }}>B</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          Blink
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 32px' }}>
          Campus social app — React Native / Expo
        </p>

        <div
          style={{
            background: 'white',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: '20px',
            textAlign: 'left',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
            Project Structure
          </p>
          {[
            { icon: '📱', label: 'src/screens/', desc: '14 screens' },
            { icon: '🧩', label: 'src/components/', desc: 'ui/ + PostCard, BottomNav' },
            { icon: '🔐', label: 'src/context/', desc: 'AuthContext (Supabase)' },
            { icon: '🗺️', label: 'src/navigation/', desc: 'RootNavigator + navigationRef' },
            { icon: '🔔', label: 'src/services/', desc: 'notificationService + permissionService' },
            { icon: '🗄️', label: 'src/lib/', desc: 'supabase · cn · dbCompat' },
            { icon: '📐', label: 'src/types/', desc: 'auth.ts (navigation + profile types)' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '14px 18px',
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', margin: '0 0 4px' }}>
            ✅ Notifications wired up
          </p>
          <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.6 }}>
            In-app badge on Bell icon + BottomNav tab • Push via expo-notifications •
            Android channels (default + messages) • Token saved to Supabase push_tokens table
          </p>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
          Run with <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>npx expo start</code> or build with EAS
        </p>
      </div>
    </div>
  );
}
