import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      token,
      type: 'signup',
      email: '', // Email opcional para verifyOtp
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: '¡Email confirmado! Tu cuenta está activa.',
      user: data.user
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al confirmar email' 
    }, { status: 500 });
  }
}
