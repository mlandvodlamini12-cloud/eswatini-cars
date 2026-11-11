import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionToken, getSessionCookieName, getSessionDuration } from '@/lib/session'
import { verifyIdToken } from '@/lib/firebase-admin'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
const ADMIN_EMAILS = ['mlandvodlamini12@gmail.com', 'admin@eswatinicars.co.sz']
async function generateUniqueUsername(email:string):Promise<string>{
  const base=email.split('@')[0].replace(/[^a-zA-Z0-9_]/g,'').toLowerCase().slice(0,18)
  if(!base)return`user${Math.floor(Math.random()*9000)+1000}`
  if(!await db.user.findUnique({where:{username:base}}))return base
  for(let i=2;i<100;i++){const c=`${base.slice(0,17)}${i}`.slice(0,20);if(!await db.user.findUnique({where:{username:c}}))return c}
  return`${base.slice(0,12)}${Date.now().toString(36).slice(-6)}`
}
export async function POST(req:NextRequest){
  try{
    const clientIP=getClientIP(req)
    const rl=checkRateLimit(`google-login:${clientIP}`,10,15*60*1000)
    if(!rl.allowed)return NextResponse.json({error:`Too many attempts. Try again in ${Math.ceil((rl.resetAt-Date.now())/60000)} minutes.`},{status:429})
    const{ idToken, nativeEmail, nativeName } = await req.json().catch(()=>({}))
    
    // Handle native APK sign-in (no ID token, just email from device account picker)
    if (!idToken && nativeEmail) {
      const email = nativeEmail.toLowerCase()
      const isAdminEmail = ADMIN_EMAILS.includes(email)
      let user = await db.user.findUnique({ where: { email } })
      if (user) {
        if (user.blocked) return NextResponse.json({ error: 'Account blocked' }, { status: 403 })
        if (!user.authProvider) user = await db.user.update({ where: { id: user.id }, data: { authProvider: 'google', role: isAdminEmail ? 'admin' : user.role } })
        else if (isAdminEmail && user.role !== 'admin') user = await db.user.update({ where: { id: user.id }, data: { role: 'admin' } })
      } else {
        user = await db.user.create({ data: { email, username: await generateUniqueUsername(email), name: nativeName || email.split('@')[0], phoneVerified: false, passwordHash: null, authProvider: 'google', role: isAdminEmail ? 'admin' : 'user' } })
      }
      const token = await createSessionToken({ userId: user.id, email: user.email, name: user.name, role: user.role as 'user' | 'admin' })
      const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name, phone: user.phone, role: user.role }, message: 'Native Google Sign-In successful' })
      response.cookies.set(getSessionCookieName(), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: getSessionDuration(), path: '/' })
      return response
    }
    
    if (!idToken || typeof idToken !== 'string') return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    const verified=await verifyIdToken(idToken)
    if('error'in verified)return NextResponse.json({error:verified.error},{status:401})
    const decoded=verified.user
    const email=(decoded.email||'').toLowerCase()
    if(!email)return NextResponse.json({error:'No email on Google account'},{status:400})
    let user=await db.user.findUnique({where:{email}})
    const isAdminEmail=ADMIN_EMAILS.includes(email)
    if(user){
      if(user.blocked)return NextResponse.json({error:'Account blocked'},{status:403})
      if(!user.authProvider)user=await db.user.update({where:{id:user.id},data:{authProvider:user.passwordHash?'password':'google',role:isAdminEmail?'admin':user.role}})
      else if(isAdminEmail&&user.role!=='admin')user=await db.user.update({where:{id:user.id},data:{role:'admin'}})
    }else{
      user=await db.user.create({data:{email,username:await generateUniqueUsername(email),name:decoded.name||email.split('@')[0],phone:decoded.phone_number||null,phoneVerified:false,passwordHash:null,authProvider:'google',role:isAdminEmail?'admin':'user'}})
    }
    const token=await createSessionToken({userId:user.id,email:user.email,name:user.name,role:user.role as 'user'|'admin'})
    const response=NextResponse.json({user:{id:user.id,email:user.email,username:user.username,name:user.name,phone:user.phone,role:user.role},message:'Google Sign-In successful'})
    response.cookies.set(getSessionCookieName(),token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:getSessionDuration(),path:'/'})
    return response
  }catch(err:any){
    console.error('[google-login] error:',err)
    return NextResponse.json({error:`Google Sign-In failed: ${err?.message||String(err)}`},{status:500})
  }
}
