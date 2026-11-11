import { jwtVerify, createRemoteJWKSet } from 'jose'
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))
const FIREBASE_PROJECT_ID = 'eswatini-cars'
const EXPECTED_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`
interface DecodedToken { iss:string;aud:string;sub:string;email?:string;name?:string;phone_number?:string;exp:number;iat:number;user_id?:string;uid?:string }
export async function verifyIdToken(idToken:string):Promise<{user:DecodedToken}|{error:string;code?:string}>{
  if(!idToken||typeof idToken!=='string')return{error:'Missing or invalid ID token',code:'invalid-token'}
  if(idToken.split('.').length!==3)return{error:'Invalid token format',code:'auth/argument-error'}
  try{
    const{payload}=await jwtVerify(idToken,JWKS,{audience:FIREBASE_PROJECT_ID,issuer:EXPECTED_ISSUER,algorithms:['RS256']})
    const decoded=payload as unknown as DecodedToken
    const now=Math.floor(Date.now()/1000)
    if(decoded.exp&&decoded.exp<now)return{error:'Your Google session expired. Please sign in again.',code:'auth/id-token-expired'}
    return{user:decoded}
  }catch(err:any){
    const f:Record<string,string>={'JWTExpired':'Your Google session expired. Please sign in again.','JWTClaimValidationFailed':'Token validation failed. Please sign in again.','JWSSignatureVerificationFailed':'Invalid token signature. Please sign in again.'}
    return{error:f[err?.code]||err?.message||'Invalid ID token',code:err?.code||'auth/invalid-id-token'}
  }
}
