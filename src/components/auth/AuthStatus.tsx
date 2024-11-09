'use client';

import { useSession } from 'next-auth/react';

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Not signed in</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="font-bold mb-2">Session Info</h2>
      <pre className="bg-gray-100 p-2 rounded">
        {JSON.stringify({
          email: session?.user?.email,
          role: session?.user?.role || 'free',
          contractsRemaining: session?.user?.contractsRemaining || 3,
        }, null, 2)}
      </pre>
    </div>
  );
}
