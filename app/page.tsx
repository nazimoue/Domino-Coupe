'use client';
/* eslint-disable react/no-unescaped-entities */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/regles');
  }, [router]);

  return null;
}
