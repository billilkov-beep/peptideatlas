let csrfToken='';
export const setCsrf=(token:string)=>{csrfToken=token;};
export class ApiError extends Error { constructor(message:string,public status:number){super(message);} }
export async function api<T=any>(path:string,options:RequestInit={}):Promise<T>{
  const method=options.method||'GET';
  const headers:Record<string,string>={...(options.body?{'content-type':'application/json'}:{}),...(method!=='GET'&&csrfToken?{'x-csrf-token':csrfToken}:{}),...(options.headers as Record<string,string>||{})};
  const response=await fetch(path,{...options,headers,credentials:'same-origin'});
  const result=await response.json().catch(()=>({message:'The server could not complete this request.'}));
  if(!response.ok)throw new ApiError(result.message||result.error||'Request failed',response.status);
  return result;
}
export const send=(path:string,body:unknown,method='POST')=>api(path,{method,body:JSON.stringify(body)});
