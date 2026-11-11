import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionToken, getSessionCookieName } from '@/lib/session'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
export async function POST(req:NextRequest){
  try{
    const clientIP=getClientIP(req)
    const rl=checkRateLimit(`request-response:${clientIP}`,5,60*60*1000)
    if(!rl.allowed)return NextResponse.json({error:'Too many submissions. Please try again later.'},{status:429})
    const{requestId,responderName,responderPhone,responderEmail,message}=await req.json().catch(()=>({}))
    if(!requestId)return NextResponse.json({error:'Missing requestId'},{status:400})
    if(!responderName)return NextResponse.json({error:'Please enter your name'},{status:400})
    if(!responderPhone)return NextResponse.json({error:'Please enter your phone number'},{status:400})
    if(!message||message.trim().length<10)return NextResponse.json({error:'Please enter a message (at least 10 characters)'},{status:400})
    const vehicleRequest=await db.vehicleRequest.findUnique({where:{id:requestId}})
    if(!vehicleRequest)return NextResponse.json({error:'Vehicle request not found'},{status:404})
    const response=await db.requestResponse.create({data:{requestId,responderName:responderName.trim(),responderPhone:responderPhone.trim(),responderEmail:responderEmail?.trim()||null,message:message.trim(),status:'new'}})
    return NextResponse.json({success:true,responseId:response.id,message:'Response submitted. Admin will review and connect you.'})
  }catch(err:any){return NextResponse.json({error:'Failed to submit response'},{status:500})}
}
export async function GET(req:NextRequest){
  try{
    const token=req.cookies.get(getSessionCookieName())?.value
    const session=token?await verifySessionToken(token):null
    if(!session||session.role!=='admin')return NextResponse.json({error:'Admin access required'},{status:403})
    const responses=await db.requestResponse.findMany({orderBy:{createdAt:'desc'},take:100,include:{request:{select:{id:true,requesterName:true,requesterPhone:true,vehicleType:true,make:true,model:true,minBudget:true,maxBudget:true,region:true}}}})
    return NextResponse.json({responses})
  }catch{return NextResponse.json({error:'Failed'},{status:500})}
}
