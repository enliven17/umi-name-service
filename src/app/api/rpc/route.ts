import { NextResponse } from 'next/server';

const UMI_RPC = 'https://devnet.uminetwork.com';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const resp = await fetch(UMI_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body,
    });
    const text = await resp.text();
    const contentType = resp.headers.get('content-type') || 'application/json';
    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': contentType } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'proxy_error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', proxy: 'umi-rpc' });
}
