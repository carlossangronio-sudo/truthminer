import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Subscribe] Supabase non configuré');
    return NextResponse.json(
      { error: 'Service indisponible. Configuration Supabase manquante.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const checkUrl = new URL('/rest/v1/subscribers', supabaseUrl);
    checkUrl.searchParams.set('select', 'id,email');
    checkUrl.searchParams.set('email', `eq.${email}`);
    checkUrl.searchParams.set('limit', '1');

    const existingRes = await fetch(checkUrl.toString(), {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: 'no-store',
    });

    if (!existingRes.ok) {
      const text = await existingRes.text();
      console.error('[Subscribe] Erreur Supabase (check):', text);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de votre email.' },
        { status: 500 }
      );
    }

    const existing = (await existingRes.json()) as Array<{ id: string; email: string }>;
    if (existing.length > 0) {
      return NextResponse.json(
        { success: true, alreadySubscribed: true },
        { status: 200 }
      );
    }

    // Insérer le nouvel abonné
    const insertUrl = new URL('/rest/v1/subscribers', supabaseUrl);

    const insertRes = await fetch(insertUrl.toString(), {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ email }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      console.error('[Subscribe] Erreur Supabase (insert):', text);

      // Conflit unique (email déjà en base) → considérer comme abonné
      if (insertRes.status === 409) {
        return NextResponse.json(
          { success: true, alreadySubscribed: true },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Impossible d'enregistrer votre email pour le moment." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Subscribe] Erreur inattendue:', error);
    return NextResponse.json(
      { error: 'Erreur serveur inattendue.' },
      { status: 500 }
    );
  }
}



