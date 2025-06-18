"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[987],{8987:(e,t,r)=>{r.r(t),r.d(t,{default:()=>eP});var n=r(7876),a=r(4232),o=r(3138),i=r(4027),l=r(7152),s=r(8040),d=r(6002),c=r(1937),u=r(6594),m=r(4846);r(1782);var p=r(6895),h=r.n(p);r(3579);var g=r(8477),x=r(8615),f=r(7232);let b=f.Ay.div`
  position: absolute;
  background: rgba(241, 245, 249, 0.3); /* 약간의 투명도 추가 */
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 2000;
`,y=f.Ay.div`
  background: rgba(30, 58, 138, 0.7); /* 약간의 투명도 추가 */
  padding: 8px;
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid #ccc;
  cursor: grab; /* 드래그 가능 표시 */

  button {
    background: rgba(128, 0, 32, 0.8); /* 약간의 투명도 추가 */
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: rgba(165, 42, 42, 0.8); /* 약간의 투명도 추가 */
    }
  }
`,w=f.Ay.div`
  background: rgba(241, 245, 249, 0.6); /* 약간의 투명도 추가 */
  overflow: auto;
  height: calc(100%); /* 헤더 높이를 제외한 영역 */
`,j=f.Ay.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 16px;
  background: rgba(204, 204, 204, 0.6); /* 약간의 투명도 추가 */
  cursor: se-resize;
`,v=e=>{let{onClose:t,children:r}=e,[o,i]=(0,a.useState)({width:380,height:850,top:(window.innerHeight-850)/2,left:(window.innerWidth-380)/2}),[l,s]=(0,a.useState)(!1),[d,c]=(0,a.useState)(null);(0,a.useEffect)(()=>{let e=()=>{window.innerWidth<=768?i({width:.9*window.innerWidth,height:.8*window.innerHeight,top:.1*window.innerHeight/2,left:.1*window.innerWidth/2}):i({width:380,height:850,top:(window.innerHeight-850)/2,left:(window.innerWidth-380)/2})};return e(),window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]);let u=e=>{if(l&&d){let t=e.clientX-d.x,r=e.clientY-d.y;i(e=>({...e,top:r,left:t}))}},m=()=>{s(!1),c(null)};return(0,a.useEffect)(()=>(l?(document.addEventListener("mousemove",u),document.addEventListener("mouseup",m)):(document.removeEventListener("mousemove",u),document.removeEventListener("mouseup",m)),()=>{document.removeEventListener("mousemove",u),document.removeEventListener("mouseup",m)}),[l]),g.createPortal((0,n.jsxs)(b,{style:{width:o.width,height:o.height,top:o.top,left:o.left},children:[(0,n.jsx)(y,{onMouseDown:e=>{s(!0),c({x:e.clientX-o.left,y:e.clientY-o.top})},children:(0,n.jsx)("button",{onClick:t,children:(0,n.jsx)(x.yGN,{})})}),(0,n.jsx)(w,{children:r}),(0,n.jsx)(j,{onMouseDown:e=>{let t=o.width,r=o.height,n=e.clientX,a=e.clientY,l=e=>{let o=t+(e.clientX-n),l=r+(e.clientY-a);i(e=>({...e,width:Math.max(o,150),height:Math.max(l,100)}))},s=()=>{document.removeEventListener("mousemove",l),document.removeEventListener("mouseup",s)};document.addEventListener("mousemove",l),document.addEventListener("mouseup",s)},onDoubleClick:()=>{i(e=>({...e,width:380,height:425}))}})]}),document.body)};var k=r(7181),N=r(1040),C=r(1602),S=r(9099);let T=()=>{let e=(0,S.useRouter)(),t=(0,k.A)(e=>e.resetEditedTask),r=async()=>{let{data:e}=await N.A.get("http://localhost:8080/csrf");N.A.defaults.headers.common["X-CSRF-TOKEN"]=e.csrf_token};return{switchErrorHandling:n=>{switch(n){case"invalid csrf token":r(),alert("CSRF token is invalid, please try again");break;case"invalid or expired jwt":alert("access token expired, please login"),t(),e.push("/");break;case"missing or malformed jwt":alert("access token is not valid, please login"),t(),e.push("/");break;case"duplicated key not allowed":alert("email already exist, please use another one");break;case"crypto/bcrypt: hashedPassword is not the hash of the given password":alert("password is not correct");break;case"record not found":alert("email is not correct");break;default:alert(n)}}}},E=()=>{let{switchErrorHandling:e}=T(),t=async()=>{let{data:e}=await N.A.get("http://localhost:8080/networks/map",{withCredentials:!0});return e};return(0,C.I)({queryKey:["networks"],queryFn:t,staleTime:1/0,onError:t=>{t.response.data.message?e(t.response.data.message):e(t.response.data)}})},A=(e,t)=>{let{switchErrorHandling:r}=T(),n=async()=>{let{data:r}=await N.A.get("http://localhost:8080/networks/search",{params:{searchQuery:e,page:t},withCredentials:!0});return r};return(0,C.I)({queryKey:["searchNetworks",e,t],queryFn:n,staleTime:1/0,onError:e=>{e.response?.data?.message?r(e.response.data.message):r(e.response.data)}})};var I=r(5558),z=r.n(I),$=r(1971),R=r(8406),P=r(5461),F=r(5526);let _=()=>{let e=(0,P.jE)(),{switchErrorHandling:t}=T(),r=(0,k.A)(e=>e.resetEditedNetwork),n=(0,F.n)(e=>N.A.post("http://localhost:8080/networks",e,{headers:{"Content-Type":"multipart/form-data"}}),{onSuccess:t=>{let n=e.getQueryData(["networks"]);n&&e.setQueryData(["networks"],[...n,t.data]),r()},onError:e=>{e.response.data.message?t(e.response.data.message):t(e.response.data)}});return{createNetworkMutation:n,updateNetworkMutation:(0,F.n)(e=>{let{id:t,formData:r}=e;return N.A.put(`http://localhost:8080/networks/${t}`,r,{headers:{"Content-Type":"multipart/form-data"}})},{onSuccess:(t,n)=>{let a=e.getQueryData(["networks"]);a&&e.setQueryData(["networks"],a.map(e=>e.id===n.id?t.data:e)),r()},onError:e=>{e.response.data.message?t(e.response.data.message):t(e.response.data)}}),deleteNetworkMutation:(0,F.n)(e=>N.A.delete(`http://localhost:8080/networks/${e}`),{onSuccess:(t,n)=>{let a=e.getQueryData(["networks"]);a&&e.setQueryData(["networks"],a.filter(e=>e.id!==n)),r()},onError:e=>{e.response.data.message?t(e.response.data.message):t(e.response.data)}})}};var L=r(8307);let M=(0,a.memo)(e=>{let{id:t,user_id:r,user_name:a,title:o,type:i,nationality:l,ethnicity:s,migration_year:d,end_year:c,latitude:u,longitude:p,connections:h,edges:g,migration_traces:x,setFocusedNode:f,handleEntityClick:b,handleMigrationTraceClick:y,handleEdgeClick:w,handleNetworkEdgesToggle:j}=e,v=(0,k.A)(e=>e.updateEditedNetwork),{deleteNetworkMutation:N}=_(),C=(0,L.Zp)(),S=(0,L.zy)(),{t:T}=(0,m.Bd)(),{user:E}=(0,k.A)();return(0,n.jsxs)("li",{className:"my-3 px-2 py-2 bg-[#f2f2f2] rounded shadow-md text-xs w-full max-w-lg",children:[(0,n.jsxs)("div",{className:"flex justify-between items-center w-full max-w-lg",children:[(0,n.jsxs)("span",{className:"text-xs font-bold block p-4 border rounded-lg hover:bg-gray-100 transition-all cursor-pointer w-full sm:w-auto",onClick:()=>"/network"!==S.pathname?(f({lat:u,lng:p}),b(t)):null,children:["No.",t," : ",o]}),(0,n.jsxs)("span",{className:"font-bold text-xs flex justify-between items-center",children:[T("Creator Name")," : ",a]}),r===E.id?(0,n.jsxs)("div",{className:"flex ml-4",children:[(0,n.jsx)($.A,{className:"h-4 w-4 mx-1 text-blue-500 cursor-pointer",onClick:()=>{v({id:t,title:o,type:i,nationality:l,ethnicity:s,migration_year:d,end_year:c,latitude:u,longitude:p,connections:h,edge:g,migration_traces:x,user_id:0}),window.location.href.includes("network")?window.scrollTo({top:document.body.scrollHeight,behavior:"instant"}):C("/network")}}),(0,n.jsx)(R.A,{className:"h-4 w-4 text-red-500 cursor-pointer",onClick:()=>{window.confirm(`Are you sure you want to delete "${o}"?`)&&N.mutate(t)}})]}):(0,n.jsx)("div",{className:"flex ml-4"})]}),(0,n.jsxs)("div",{className:"mt-2 overflow-x-auto",children:[(0,n.jsxs)("table",{className:"table-auto w-full mt-2 border-collapse text-xs",children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{className:"px-1 py-1 border font-semibold text-center",children:T("Type")}),(0,n.jsx)("th",{className:"px-1 py-1 border font-semibold text-center",children:T("Nationality")}),(0,n.jsx)("th",{className:"px-1 py-1 border font-semibold text-center",children:T("Ethnicity")}),(0,n.jsx)("th",{className:"px-1 py-1 border font-semibold text-center",children:T("Person"===i?"Birth":"Established")}),(0,n.jsx)("th",{className:"px-1 py-1 border font-semibold text-center",children:T("Person"===i?"Death":"Dissolved")}),(0,n.jsx)("th",{className:"px-1 py-1 border font-semibold text-center",children:T("Lat.")}),(0,n.jsx)("th",{className:"px-1 py-1 border font-semibold text-center",children:T("Long.")})]})}),(0,n.jsx)("tbody",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{className:"px-1 py-1 border text-center",children:i}),(0,n.jsx)("td",{className:"px-1 py-1 border text-center truncate",children:l}),(0,n.jsx)("td",{className:"px-1 py-1 border text-center truncate",children:s}),(0,n.jsx)("td",{className:"px-1 py-1 border text-center",children:d}),(0,n.jsx)("td",{className:"px-1 py-1 border text-center",children:c}),(0,n.jsx)("td",{className:"px-1 py-1 border text-center truncate",children:u.toFixed(5)}),(0,n.jsx)("td",{className:"px-1 py-1 border text-center truncate",children:p.toFixed(5)})]})})]}),(0,n.jsxs)("div",{className:"mt-4",children:[(0,n.jsx)("div",{className:"text-xs font-bold block p-4 border rounded-lg hover:bg-gray-100 transition-all cursor-pointer",onClick:()=>j(t),children:(0,n.jsx)("strong",{children:T("Edges")})}),g?.length>0?(0,n.jsx)("div",{className:"mt-2",children:(0,n.jsxs)("table",{className:"table-auto w-full mt-2 border-collapse text-xs",children:[(0,n.jsx)("thead",{className:"cursor-pointer hover:bg-gray-100",onClick:()=>w(t),children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Target ID")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Target Type")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Strength")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Connection Type")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Year")})]})}),(0,n.jsx)("tbody",{children:g.map((e,t)=>(0,n.jsxs)("tr",{className:"cursor-pointer hover:bg-gray-100",onClick:()=>w(e.targetId),children:[(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.targetId}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.targetType}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.strength}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.edgeType}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.year})]},e.targetId))})]})}):(0,n.jsx)("p",{className:"text-xs",children:T("No edges available.")})]}),(0,n.jsxs)("div",{className:"mt-4",children:[(0,n.jsx)("div",{className:"text-xs font-bold block p-4 border rounded-lg hover:bg-gray-100 transition-all cursor-pointer",onClick:()=>y(t),children:(0,n.jsx)("strong",{children:T("Migration Trace")})}),x&&x.length>0?(0,n.jsx)("div",{className:"mt-2",children:(0,n.jsxs)("table",{className:"table-auto w-full border-collapse text-xs",children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Location")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Longitude")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Latitude")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Year")}),(0,n.jsx)("th",{className:"px-2 py-1 border font-semibold text-center",children:T("Reason")})]})}),(0,n.jsx)("tbody",{children:x.map((e,r)=>(0,n.jsxs)("tr",{className:"cursor-pointer hover:bg-gray-100",onClick:()=>y(t),children:[(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.location_name}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.longitude}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.latitude}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.migration_year}),(0,n.jsx)("td",{className:"px-2 py-1 border text-center",children:e.reason})]},r))})]})}):(0,n.jsx)("div",{className:"mt-4",children:(0,n.jsx)("p",{className:"text-xs",children:T("No migration traces available.")})})]})]})]})}),D=e=>{let{searchQuery:t,setFocusedNode:r,handleEntityClick:o,handleMigrationTraceClick:i,handleEdgeClick:l,handleNetworkEdgesToggle:s}=e,[d,c]=(0,a.useState)(1),[u,p]=(0,a.useState)(!0),{t:h}=(0,m.Bd)(),{data:g,isLoading:f,error:b}=A(t,d),y=(0,P.jE)(),w=e=>{c(e)};if(!u)return(0,n.jsxs)("button",{onClick:()=>p(!0),className:"fixed top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition",children:[(0,n.jsx)(x.CKj,{size:20})," "]});if(f)return(0,n.jsx)("p",{children:"Loading..."});if(b)return(0,n.jsxs)("p",{children:["Error: ",b.message]});let j=g?.totalPages||0,v=g?.networks?.length||0;return(0,n.jsxs)("div",{className:"relative my-1 w-full max-w-lg sm:max-w-full shadow-md rounded-md p-2",children:[(0,n.jsxs)("button",{onClick:()=>p(!1),className:"fixed top-30 right-10 bg-gray-200 text-gray-600 p-2 rounded-full hover:bg-gray-300 transition",children:[(0,n.jsx)(x.yGN,{size:16})," "]}),(0,n.jsxs)("div",{className:"flex justify-center items-center mb-4 sm:text-sm",children:[(0,n.jsxs)("h2",{className:"text-lg font-bold sm:text-xl text-sm",children:[h("Found")," ",v," ",h("Results")]}),(0,n.jsx)("button",{onClick:()=>{y.invalidateQueries({queryKey:["searchNetworks"]}),alert("Cache has been cleared!")},className:"ml-1 sm:ml-2 text-red-500 hover:text-red-700",children:(0,n.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:"w-6 h-6",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 4.5v3m0 9v3m7.5-7.5h-3m-9 0H4.5m12.364-5.636l-2.121 2.121m-6.364 6.364L5.636 16.95m12.728 0l-2.121-2.121m-6.364-6.364L5.636 7.05"})})})]}),(0,n.jsx)("div",{className:"flex flex-col sm:flex-row items-center justify-between mt-4",children:(0,n.jsxs)("div",{className:"flex justify-center items-center flex-1 gap-4",children:[(0,n.jsx)("button",{onClick:()=>w(d-1),disabled:1===d,className:"px-4 py-2 bg-blue-500 text-sm text-white rounded disabled:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm px-2 py-1 text-xs",children:h("Prev")}),(0,n.jsxs)("span",{className:"text-sm",children:[d," / ",j]}),(0,n.jsx)("button",{onClick:()=>w(d+1),disabled:d>=j,className:"px-4 py-2 bg-blue-500 text-sm text-white rounded disabled:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm px-2 py-1 text-xs",children:h("Next")})]})}),g&&g.networks&&0!==g.networks.length?(0,n.jsx)("ul",{className:"space-y-4 flex flex-col items-center",children:g?.networks.map(e=>(0,n.jsx)(M,{...e,setFocusedNode:r,handleEntityClick:o,handleMigrationTraceClick:i,handleEdgeClick:l,handleNetworkEdgesToggle:s},e.id))}):(0,n.jsx)("p",{className:"text-center",children:h("No search results found.")})]})};var O=r(4988),B=r(4957);let Y=r(9742).env.REACT_APP_API_URL,W=async e=>(await N.A.get(`${Y}/comments/network/${e}`)).data,V=async e=>(await N.A.post(`${Y}/comments`,e)).data,H=async e=>(await N.A.put(`${Y}/comments/${e.id}`,e)).data,U=async e=>{await N.A.delete(`${Y}/comments/${e}`)},q=(0,B.vt)((e,t)=>({comments:{},currentNetworkId:null,fetchComments:async t=>{let r=await W(t);e(e=>({comments:{...e.comments,[t]:r},currentNetworkId:t}))},createComment:async(t,r)=>{let n=await V(r);return e(e=>({comments:{...e.comments,[t]:[...e.comments[t]||[],n]}})),n},updateComment:async(t,r)=>{let n=await H(r);e(e=>({comments:{...e.comments,[t]:e.comments[t].map(e=>e.id===n.id?n:e)}}))},deleteComment:async(t,r)=>{await U(r),e(e=>({comments:{...e.comments,[t]:e.comments[t].filter(e=>e.id!==r)}}))}})),K=e=>{let{networkId:t}=e,{comments:r,currentNetworkId:o,fetchComments:i,createComment:l,updateComment:s,deleteComment:d}=q(),[c,u]=(0,a.useState)(""),[p,h]=(0,a.useState)(null),{user:g}=(0,k.A)(),{t:x}=(0,m.Bd)();(0,a.useEffect)(()=>{o!==t&&i(t)},[t,o,i]);let f=async()=>{if(c.trim()){let e={network_id:t,user_id:g?.id??0,user_name:g?.name||"Guest",user_role:g?.role||"Guest",content:c};await l(t,e),u("")}},b=async()=>{p&&p.content.trim()&&(await s(t,p),h(null))},y=async e=>{g&&await d(t,e)};return(0,n.jsxs)("div",{className:"w-30 h-30 mx-auto bg-[rgba(241,245,249,0.6)] p-3",children:[" ",(0,n.jsx)("h3",{className:"text-sm font-semibold mb-2",children:x("Comments")}),(0,n.jsx)("ul",{className:"space-y-2",children:r[t]&&r[t].length>0?r[t].map(e=>(0,n.jsxs)("li",{className:"flex flex-col bg-white p-2 border border-gray-200 rounded overflow-y-auto",children:[p?.id===e.id?(0,n.jsx)("input",{type:"text",value:p.content,onChange:e=>h({...p,content:e.target.value}),className:"w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs"}):(0,n.jsxs)("div",{className:"text-xs text-gray-800 overflow-y-auto",children:[(0,n.jsxs)("div",{className:"flex items-center space-x-2",children:[(0,n.jsx)("span",{className:"font-semibold text-gray-900",children:e.user_name}),(0,n.jsxs)("span",{className:"text-gray-500",children:["(",x(e.user_role),")"]}),(0,n.jsx)("span",{className:"text-gray-400 text-[11px]",children:e.created_at instanceof Date?e.created_at.toISOString().split("T")[0].replace(/-/g,"/"):new Date(e.created_at).toISOString().split("T")[0].replace(/-/g,"/")})]}),(0,n.jsx)("p",{className:"mt-1 text-gray-700",children:e.content})]}),g&&e.user_id===g.id&&(0,n.jsxs)("div",{className:"flex justify-end space-x-1 mt-1",children:[p?.id===e.id?(0,n.jsx)("button",{onClick:b,className:"px-2 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600",children:x("Save")}):(0,n.jsx)("button",{onClick:()=>h(e),className:"px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600",children:x("Edit")}),(0,n.jsx)("button",{onClick:()=>y(e.id),className:"px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600",children:x("Delete")})]})]},e.id)):(0,n.jsx)("p",{className:"text-xs text-gray-500",children:x("No comments yet.")})}),g.isLoggedIn&&(0,n.jsxs)("div",{className:"flex flex-col mt-3",children:[(0,n.jsx)("input",{type:"text",value:c,onChange:e=>u(e.target.value),placeholder:x("add comments"),className:"flex-1 p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"}),(0,n.jsx)("button",{onClick:f,className:"px-3 py-1 mt-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600",children:x("Add")})]})]})};var Q=r(6691),G=r(4796),J=r(5693);let X=a.memo(e=>{let{networks:t,filters:r,filteredNetworks:o,filteredTraces:i,filteredEdges:l,handleEdgeClick:s,handleNetworkEdgesToggle:d}=e,c=(0,a.useRef)(null),u=function(e,t){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5,n=Math.PI/180*(90-e),a=Math.PI/180*(t+180),o=-(r*Math.sin(n)*Math.cos(a)),i=r*Math.cos(n),l=r*Math.sin(n)*Math.sin(a);return new Q.Pq0(o,i,l)},m=function(e,t){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:5,n=new Q.Pq0().copy(e).normalize().multiplyScalar(+r),a=new Q.Pq0().addVectors(e,t).multiplyScalar(.5).normalize().multiplyScalar(1.05*r);return new Q.B6O([n,a,t])};return(0,a.useEffect)(()=>{if(!c.current)return;let e=new Q.Z58,t=new Q.ubm(75,window.innerWidth/window.innerHeight,.1,1e3),r=new G.JeP({antialias:!0});r.setSize(window.innerWidth,window.innerHeight),c.current.appendChild(r.domElement);let n=new J.N(t,r.domElement);n.enableDamping=!0,n.dampingFactor=.25,n.enableZoom=!0;let a=u(35,120,15);t.position.set(a.x,a.y,a.z),t.lookAt(0,0,0);let s=new Q.Gu$(5,32,32),d=new Q.Tap().load("/texture/earth.jpg",()=>{r.render(e,t)}),p=new Q.V9B({map:d}),h=new Q.eaF(s,p);e.add(h);let g=new Q.$p8(0xffffff,.5);e.add(g),o.forEach(t=>{let r=u(t.latitude,t.longitude,5),n=new Q.Gu$(.03,16,16),a=new Q.V9B({color:"Person"===t.type?0xff0000:255}),o=new Q.eaF(n,a);o.position.copy(r),e.add(o)}),l.forEach(t=>{let r=m(u(t.startLat,t.startLon,5),u(t.endLat,t.endLon,5)),n=new Q.j6(r,64,.01,8,!1),a=new Q.V9B({color:0xffa500}),o=new Q.eaF(n,a);e.add(o);for(let t=1;t<=3;t++){let n=t/4,a=r.getPoint(n),o=r.getTangent(n).normalize(),i=new Q.E0M(o,a,.2,0xffff00);e.add(i)}}),i.forEach((t,r)=>{if(r<i.length-1){let n=m(u(t.latitude,t.longitude,5),u(i[r+1].latitude,i[r+1].longitude,5)),a=new Q.j6(n,64,.01,8,!1),o=new Q.V9B({color:0xffa500}),l=new Q.eaF(a,o);e.add(l);for(let t=1;t<=3;t++){let r=t/4,a=n.getPoint(r),o=n.getTangent(r).normalize(),i=new Q.E0M(o,a,.2,0xffff00);e.add(i)}}});let x=()=>{requestAnimationFrame(x),n.update(),r.render(e,t)};return x(),()=>{c.current?.removeChild(r.domElement)}},[o,l,i]),(0,n.jsx)("div",{ref:c,style:{width:"100%",height:"100%"}})}),Z=e=>{let{traces:t}=e,r=(0,o.ko)(),n=(0,a.useRef)(null);return(0,a.useEffect)(()=>{if(!t||t.length<2)return;let e=h().layerGroup(),a=[];t.slice(0,-1).forEach((r,n)=>{let a=t[n+1];if(r.network_id!==a.network_id)return;if(!r||!a||!r.latitude||!r.longitude||!a.latitude||!a.longitude)return void console.warn("Invalid trace data:",{trace:r,nextTrace:a});let o=h().polyline([[r.latitude,r.longitude],[a.latitude,a.longitude]],{color:"#1976d2",weight:3,opacity:.8,dashArray:"5, 5"}),i=h().polylineDecorator(o,{patterns:[{offset:"50%",repeat:0,symbol:h().Symbol.arrowHead({pixelSize:15,polygon:!0,headAngle:45,pathOptions:{fillOpacity:1,weight:0,color:"#FF0000"}})}]});e.addLayer(o),e.addLayer(i)}),e.addTo(r);let o=0,i=()=>{o=(o+1)%100,a.forEach(e=>{let{decorator:t}=e;t.setPatterns([{offset:`${o}%`,repeat:"10%",symbol:h().Symbol.dash({pixelSize:10,pathOptions:{color:"#FF0000",weight:2}})}])}),n.current=requestAnimationFrame(i)};return i(),()=>{n.current&&cancelAnimationFrame(n.current),e.clearLayers(),r.removeLayer(e)}},[r,t]),null},ee=(e,t)=>{let r={},n={};switch(e.forEach(e=>{n[e.id]=(e.edges||[]).map(e=>e.targetId)}),t){case"degree":for(let e in n)r[e]=0;for(let t in n)for(let a in r[t]+=n[t].reduce((r,n)=>{let a=e.find(e=>e.id===Number(t))?.edges.find(e=>e.targetId===n);return r+(a?a.strength:1)},0),n)if(n[a].includes(Number(t))){let n=e.find(e=>e.id===Number(a))?.edges.find(e=>e.targetId===Number(t));r[t]+=n?n.strength:1}break;case"betweenness":for(let e in n)r[e]=0;for(let t in n){let a={},o={},i={},l=[],s=new Set;for(Object.keys(n).forEach(e=>{o[Number(e)]=1/0,a[Number(e)]=0,i[Number(e)]=[]}),o[Number(t)]=0,a[Number(t)]=1,l.push(Number(t));l.length>0;){let t=l.shift();s.add(t),n[t].forEach(r=>{let n=e.find(e=>e.id===t)?.edges.find(e=>e.targetId===r),d=n?n.strength:1,c=o[t]+d;c<o[r]?(o[r]=c,i[r]=[t],a[r]=a[t],s.has(r)||l.push(r)):c===o[r]&&(i[r].push(t),a[r]+=a[t])})}let d={};Object.keys(i).forEach(e=>{d[Number(e)]=0}),Object.keys(i).map(Number).sort((e,t)=>o[t]-o[e]).forEach(e=>{i[e].forEach(t=>{let r=a[t]/a[e]*(1+d[e]);d[t]+=r}),e!==Number(t)&&(r[e]+=d[e])})}let a=Object.keys(n).length;Object.keys(r).forEach(e=>{r[Number(e)]/=(a-1)*(a-2)});break;case"closeness":for(let e in n){let t=Object.values(et(Number(e),n)).reduce((e,t)=>e+t,0);r[e]=t>0?1/t:0}break;case"eigenvector":let o=Object.keys(n).length,i={},l={};Object.keys(n).forEach(e=>{i[Number(e)]=1/Math.sqrt(o)});let s=1/0,d=0;for(;s>1e-6&&d<100;){for(let t in l={...i},s=0,n){let r=0;for(let a in n[Number(t)].forEach(n=>{let a=e.find(e=>e.id===Number(t))?.edges.find(e=>e.targetId===n),o=a?a.strength:1;r+=l[n]*o}),n)if(n[a].includes(Number(t))){let n=e.find(e=>e.id===Number(a))?.edges.find(e=>e.targetId===Number(t)),o=n?n.strength:1;r+=l[Number(a)]*o}i[Number(t)]=r}let t=Math.sqrt(Object.values(i).reduce((e,t)=>e+t*t,0));for(let e in i)i[Number(e)]/=t||1;Object.keys(i).forEach(e=>{s+=Math.abs(i[Number(e)]-l[Number(e)])}),d++}r=i}return r},et=(e,t)=>{let r=[[e,0]],n={[e]:0},a=new Set([e]);for(;r.length>0;){let[e,o]=r.shift();(t[e]||[]).forEach(e=>{a.has(e)||(a.add(e),n[e]=o+1,r.push([e,o+1]))})}return n};var er=r(9357);let en=`
  background-color: rgba(255, 255, 255, 0.7);
  padding: 7px;
  top: 0;
  right: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 0.7rem;
  max-width: 10rem;
  overflow-y: auto;
  h2 {
    font-size: 1rem;
    margin-bottom: 0.3rem;
    text-align: center;
    font-weight: bold;
  }
  div {
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
  }
  @media (max-width: 768px) {
    font-size: 0.7rem;
    max-width: 8rem;
    h2 {
      font-size: 0.9rem;
    }
    div {
      font-size: 0.8rem;
    }
  }
  @media (max-width: 480px) {
    font-size: 0.4rem;
    max-width: 7rem;
    h2 {
      font-size: 0.7rem;
    }
    div {
      font-size: 0.7rem;
    }
  }
`,ea=e=>{let{topNetworks:t,onEntityClick:r,centralityType:i,networkAnalysis:l}=e,s=(0,o.ko)(),{t:d}=(0,m.Bd)();return(0,a.useEffect)(()=>{let e=new(h()).Control({position:"topright"});return e.onAdd=()=>{let e=h().DomUtil.create("div","legend-container");if(e.style.cssText=en,e.innerHTML=`
      <div style="display: flex; align-items: center; margin-bottom: 7px;">
        <div style="width: 28px; height: 0; border-top: 4px dashed #ff9800; margin: 0 8px; vertical-align: middle;"></div>
        <span style="color:#e65100; font-weight:600;">${d("Connections")}</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 7px;">
        <div style="width: 28px; height: 0; border-top: 4px dashed #1976d2; margin: 0 8px; vertical-align: middle;"></div>
        <span style="color:#1976d2; font-weight:600;">${d("Mobility")}</span>
      </div>
    `,"none"!==i){let r=t.map((e,t)=>`<div style="cursor: pointer;" data-id="${e.id}">
              ${t+1}. ${e.name}: ${e.centrality.toFixed(2)}
            </div>`).join("");e.innerHTML+=`<br><strong>${d("topEntities")}</strong><br>${r}`;let n=l.map(e=>`<div>${e}</div>`).join("");e.innerHTML+=`<br><strong>${d("Analysis Results")}</strong><br>${n}`}return e.addEventListener("click",e=>{let t=e.target.getAttribute("data-id");t&&r(Number(t))}),e},e.addTo(s),()=>{e.remove()}},[s,d,t,i,r,l]),(0,n.jsxs)("div",{className:"legend-container",style:{backgroundColor:"rgba(255, 255, 255, 0.7)",padding:"7px",top:0,right:"1rem",borderRadius:"0.5rem",boxShadow:"0 0 10px rgba(0, 0, 0, 0.1)",fontSize:"0.7rem",maxWidth:"10rem",overflowY:"auto"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",marginBottom:"7px"},children:[(0,n.jsx)("div",{style:{width:"28px",height:0,borderTop:"4px dashed #ff9800",margin:"0 8px",verticalAlign:"middle"}}),(0,n.jsx)("span",{style:{color:"#e65100",fontWeight:600},children:d("Connections")})]}),(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",marginBottom:"7px"},children:[(0,n.jsx)("div",{style:{width:"28px",height:0,borderTop:"4px dashed #1976d2",margin:"0 8px",verticalAlign:"middle"}}),(0,n.jsx)("span",{style:{color:"#1976d2",fontWeight:600},children:d("Mobility")})]}),"none"!==i&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("br",{}),(0,n.jsx)("strong",{children:d("topEntities")}),(0,n.jsx)("br",{}),t.map((e,t)=>(0,n.jsxs)("div",{style:{cursor:"pointer"},onClick:()=>r(e.id),children:[t+1,". ",e.name,": ",e.centrality.toFixed(2)]},e.id)),(0,n.jsx)("br",{}),(0,n.jsx)("strong",{children:d("Analysis Results")}),(0,n.jsx)("br",{}),l.map((e,t)=>(0,n.jsx)("div",{children:e},t))]})]})},eo=(e,t,r)=>{let n=[],a=e.length,o=t.length,i=ee(e,"degree"),l=Math.max(...Object.values(i)),s=Object.values(i).reduce((e,t)=>e+t,0)/a;l>.3*a&&n.push("Hub-Dominated Network"),n.push(`Average Degree Centrality: ${s.toFixed(2)}`);let d=o/(a*(a-1)/2);d>.5?n.push("Dense Network"):d<.1&&n.push("Sparse Network"),n.push(`Network Density: ${d.toFixed(2)}`);let c=r.length;return n.push(`Average Traces Per Node: ${(c/a).toFixed(2)}`),n};var ei=r(4917),el=r.n(ei),es=r(1806);let ed=e=>{let{onSearch:t}=e,[r,o]=(0,a.useState)("");return(0,n.jsxs)("div",{className:"w-full flex items-center gap-2",children:[" ",(0,n.jsx)("input",{type:"text",placeholder:(0,es.t)("Search Networks"),value:r,onChange:e=>{o(e.target.value)},onKeyDown:e=>{"Enter"===e.key?t(r):"Escape"===e.key&&(o(""),t(""))},className:"w-full p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"}),(0,n.jsx)("button",{onClick:()=>t(r),className:"px-4 py-1 bg-amber-700 text-white rounded hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500",children:(0,n.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",className:"w-5 h-5",children:(0,n.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 21l-4.35-4.35m1.94-7.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"})})})]})},ec=e=>{let{value:t,onChange:r,placeholderStart:o="Start Year",placeholderEnd:i="End Year",min:l=-5e3,max:s=5e3}=e,[d,c]=(0,a.useState)(t[0]),[u,m]=(0,a.useState)(t[1]),p=(0,a.useRef)(null);return(0,a.useEffect)(()=>{c(t[0]),m(t[1])},[t]),(0,a.useEffect)(()=>(p.current&&clearTimeout(p.current),p.current=setTimeout(()=>{r([d,u])},1e3),()=>{p.current&&clearTimeout(p.current)}),[d,u]),(0,n.jsxs)("div",{className:"flex items-center gap-2",children:[(0,n.jsx)("input",{type:"number",min:l,max:s,placeholder:o,value:0===d?"":d,onChange:e=>{c(""===e.target.value?0:parseInt(e.target.value))},className:"w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"}),(0,n.jsx)("span",{className:"text-sm",children:"-"}),(0,n.jsx)("input",{type:"number",min:l,max:s,placeholder:i,value:0===u?"":u,onChange:e=>{m(""===e.target.value?0:parseInt(e.target.value))},className:"w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"})]})},eu=e=>{let{value:t,onChange:r,placeholderStart:o="Start Year",placeholderEnd:i="End Year",min:l=-5e3,max:s=5e3}=e,[d,c]=(0,a.useState)(t[0]),[u,m]=(0,a.useState)(t[1]),p=(0,a.useRef)(null);return(0,a.useEffect)(()=>{c(t[0]),m(t[1])},[t]),(0,a.useEffect)(()=>(p.current&&clearTimeout(p.current),p.current=setTimeout(()=>{r([d,u])},1e3),()=>{p.current&&clearTimeout(p.current)}),[d,u]),(0,n.jsxs)("div",{className:"flex items-center gap-2",children:[(0,n.jsx)("input",{type:"number",min:l,max:s,placeholder:o,value:0===d?"":d,onChange:e=>c(""===e.target.value?0:parseInt(e.target.value)),className:"w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"}),(0,n.jsx)("span",{className:"text-sm",children:"-"}),(0,n.jsx)("input",{type:"number",min:l,max:s,placeholder:i,value:0===u?"":u,onChange:e=>m(""===e.target.value?0:parseInt(e.target.value)),className:"w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"})]})},em=e=>{let{progress:t}=e;return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",width:"100vw",zIndex:99999,background:"rgba(255,255,255,0.7)",position:"fixed",top:0,left:0},children:[(0,n.jsx)("div",{className:"loader"}),(0,n.jsx)("div",{style:{marginTop:16,fontSize:18,color:"#3e2723"},children:"Loading..."}),(0,n.jsx)("style",{children:`
      .loader {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #3e2723;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
      `})]})};function ep(e){return{type:e.type,nationality:e.nationality,ethnicity:e.ethnicity,migrationYear:e.migration_year,endYear:e.end_year,latitude:e.latitude,longitude:e.longitude,edges:e.edges,migrationTraces:e.migration_traces}}async function eh(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"gpt-4o",r=function(){if(!window.puter)throw Error("Puter.js v2 not loaded (client only)");return window.puter}();if(!Array.isArray(e))throw Error("messages must be an array");let n=await r.ai.chat(e,!1,{model:t});if(console.log("Puter API 응답:",n),n?.message?.content)return n.message.content}function eg(){return new Promise((e,t)=>{if(window.puter)return void e();if(document.querySelector('script[src="https://js.puter.com/v2/"]')){let t=()=>{window.puter?e():setTimeout(t,50)};t();return}let r=document.createElement("script");r.src="https://js.puter.com/v2/",r.async=!0,r.onload=()=>e(),r.onerror=()=>t(Error("Puter.js load failed")),document.body.appendChild(r)})}let ex=e=>{let{originId:t,originTitle:r,migrationPath:o,networkSummary:i,edges:l}=e,[s,d]=(0,a.useState)(""),[c,u]=(0,a.useState)(!1),m=async()=>{u(!0);try{await eg();let e=`이 인물의 이주 경로는 다음과 같습니다: ${o.map(e=>`${e.year}년 ${e.place} 이유: ${e.reason||"제시된 정보 없음"}`).join(" → ")}. 이 인물의 이주 스토리를 논문에 한 문단(4~5문장)으로 쓸 수 있도록 요약해주고, 마지막에 이동방식의 특징에 대한 인사이트(한 문장)도 추가해줘. 만약에 제시된 정보가 없다면 "제시된 정보가 없다"고 해. 거짓말은 안돼!`,t=await eh([{role:"system",content:"You are a migration story generator."},{role:"user",content:e}]);d(t)}catch(e){alert("AI 기능을 사용할 수 없습니다: "+(e&&"object"==typeof e&&"message"in e?e.message:JSON.stringify(e)))}u(!1)},p=(e,t,r)=>{if(!e||0===e.length)return`네트워크 ${r}(${t})는 다른 네트워크와 연결된 관계가 없습니다.`;let n=e.map(e=>`- ${r}(${t})와 ${e.targetTitle}(${e.targetId})는 ${e.year}년에 "${e.edgeType}" 관계를 맺음`).join("\n");return`${r}(${t})는 다음과 같은 관계를 맺고 있습니다:
${n}
위 관계들을 바탕으로 논문 한 문단(4~5문장)으로 요약해줘. 그리고 이 네트워크의 특징을 인사이트로 한 문장으로 말해줘. 정보가 없으면 "제시된 정보가 없다"고 해.`},h=async()=>{u(!0);try{await eg();let e=l&&l.length>0?p(l,t,r||`ID:${t}`):i,n=await eh([{role:"user",content:e}]);d(n)}catch(e){alert("AI 기능을 사용할 수 없습니다: "+(e&&"object"==typeof e&&"message"in e?e.message:JSON.stringify(e)))}u(!1)};return(0,n.jsxs)("div",{style:{margin:"0.5rem 0 0.2rem 0",padding:"0.5rem 0.2rem",background:"rgba(245,245,245,0.85)",borderRadius:"10px",boxShadow:"0 1px 6px rgba(33,150,243,0.06)",fontSize:"0.93rem"},children:[(0,n.jsxs)("div",{style:{display:"flex",gap:"0.4rem",marginBottom:"0.5rem",justifyContent:"center"},children:[(0,n.jsxs)("button",{onClick:m,disabled:c,style:{background:"#e3f2fd",border:"none",borderRadius:"7px",padding:"0.32rem 0.7rem",fontWeight:600,fontSize:"0.92rem",cursor:c?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:"0.3em",color:"#1976d2",boxShadow:"0 1px 3px rgba(33,150,243,0.07)",transition:"background 0.2s"},children:[(0,n.jsx)("span",{role:"img","aria-label":"migration",style:{fontSize:"1.1em"},children:"\uD83E\uDDF3"}),(0,n.jsx)("span",{style:{fontSize:"0.93em"},children:"이주 스토리"})]}),(0,n.jsxs)("button",{onClick:h,disabled:c,style:{background:"#fff3e0",border:"none",borderRadius:"7px",padding:"0.32rem 0.7rem",fontWeight:600,fontSize:"0.92rem",cursor:c?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:"0.3em",color:"#e65100",boxShadow:"0 1px 3px rgba(255,152,0,0.07)",transition:"background 0.2s"},children:[(0,n.jsx)("span",{role:"img","aria-label":"network",style:{fontSize:"1.1em"},children:"\uD83D\uDD78️"}),(0,n.jsx)("span",{style:{fontSize:"0.93em"},children:"관계망 스토리"})]})]}),c&&(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.5em",margin:"0.7rem 0 0.2rem 0",justifyContent:"center"},children:[(0,n.jsx)("span",{style:{width:18,height:18,border:"2.5px solid #90caf9",borderTop:"2.5px solid #fff",borderRadius:"50%",display:"inline-block",animation:"spin 1s linear infinite"}}),(0,n.jsx)("span",{style:{fontWeight:500,color:"#1976d2",fontSize:"0.93em"},children:"HistoryBot 생성 중..."}),(0,n.jsx)("style",{children:"@keyframes spin { 100% { transform: rotate(360deg); } }"})]}),s&&(0,n.jsxs)("div",{style:{background:"#f8f9fa",borderRadius:"8px",boxShadow:"0 1px 6px rgba(33,150,243,0.06)",padding:"0.7rem 0.7rem 0.7rem 0.9rem",margin:"0.5rem 0 0 0",fontSize:"0.97em",color:"#333",lineHeight:1.6,border:"1px solid #e3e3e3",position:"relative",minHeight:"2.2em",wordBreak:"keep-all",whiteSpace:"pre-line"},children:[(0,n.jsx)("span",{style:{position:"absolute",top:10,right:16,fontSize:"1.1em",opacity:.13,pointerEvents:"none"},"aria-hidden":!0,children:"✨"}),(0,n.jsxs)("div",{style:{fontWeight:700,marginBottom:"0.3em",color:"#1976d2",display:"flex",alignItems:"center",gap:"0.3em",fontSize:"0.98em"},children:[(0,n.jsx)("span",{role:"img","aria-label":"story",style:{fontSize:"1.1em"},children:"\uD83E\uDD16\uD83D\uDCDA"}),"HistoryBot 스토리 결과"]}),(0,n.jsx)("div",{style:{fontSize:"0.97em",color:"#222"},children:s})]})]})},ef=e=>{let{positions:t,patterns:r}=e,n=(0,o.ko)();return(0,a.useEffect)(()=>{if(!n||!t||t.length<2)return;let e=h().polyline(t),a=h().polylineDecorator(e,{patterns:r});return a.addTo(n),()=>{n.removeLayer(a)}},[n,t,r]),null},eb=e=>{let{lat:t,lng:r,zoom:n}=e,i=(0,o.ko)();return(0,a.useEffect)(()=>{t&&r&&i.setView([t,r],n??i.getZoom(),{animate:!0})},[t,r,n,i]),null};delete h().Icon.Default.prototype._getIconUrl,h().Icon.Default.mergeOptions({iconRetinaUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png"});let ey=e=>{let{user:t,setUser:p,guideStep:g=1}=e,x=window.innerWidth<=768,{t:f}=(0,m.Bd)(),[b,y]=(0,a.useState)(),[w,j]=(0,a.useState)(!1),[C,S]=(0,a.useState)({nationality:["all"],ethnicity:["all"],edgeType:["all"],entityType:["all"],yearRange:[1800,1945],userNetworkFilter:!1,userNetworkTraceFilter:!1,userNetworkConnectionFilter:!1,migrationReasons:["all"],selectedMigrationNetworkIds:[],searchQuery:"",forceIncludeNetworkIds:[],userNetworkEdgeFilter:!1,networkIds:[],connectionType:["all"],migrationYearRange:[1800,2025]}),[T,A]=(0,a.useState)("none"),[I,$]=(0,a.useState)(null),[R,P]=(0,a.useState)(null),{data:F}=E(),[_,L]=(0,a.useState)(null),[M,B]=(0,a.useState)(!1),Y=(0,k.A)(e=>e.updateEditedNetwork),[V,H]=(0,a.useState)([1800,1945]),[U,q]=(0,a.useState)(""),[Q,G]=(0,a.useState)(!1),[J,et]=(0,a.useState)(!1),[er,en]=(0,a.useState)([]),[ei,es]=(0,a.useState)(null),[eh,eg]=(0,a.useState)(null),[eP,eF]=(0,a.useState)(!0),[e_,eL]=(0,a.useState)(!0),[eM,eD]=(0,a.useState)(!0),[eO,eB]=(0,a.useState)(!1),[eY,eW]=(0,a.useState)(!1),[eV,eH]=(0,a.useState)(null),[eU,eq]=(0,a.useState)([]),[eK,eQ]=(0,a.useState)(""),[eG,eJ]=(0,a.useState)(!0),[eX,eZ]=(0,a.useState)(0),[e0,e1]=(0,a.useState)([]),[e2,e5]=(0,a.useState)({}),[e3,e8]=(0,a.useState)([1800,1945]),[e6,e9]=(0,a.useState)(1),e4={lat:30,lng:170,zoom:3},[e7,te]=(0,a.useState)(5),[tt,tr]=(0,a.useState)(null),[tn,ta]=(0,a.useState)([]),[to,ti]=(0,a.useState)(!1),[tl,ts]=(0,a.useState)(!1),td=async(e,t)=>{if(tn.some(t=>t.id===e.id))return;let r="";try{r=(await N.A.get(`http://localhost:8080/networks/photo/${e.id}`)).data.photo}catch(e){}ta(n=>[...n,{id:e.id,position:t,network:e,photo:r}])},tc=e=>{ta(t=>t.filter(t=>t.id!==e))},tu=(0,a.useRef)(null),tm=()=>{P({lat:e4.lat,lng:e4.lng}),setTimeout(()=>{te(e4.zoom),te(3)},200)},tp=e=>{P({lat:e.latitude,lng:e.longitude}),te(7)};(0,a.useEffect)(()=>(tu.current=new Worker(r.tu(new URL(r.p+r.u(297),r.b))),tu.current&&(tu.current.onmessage=e=>{let{type:t,payload:r}=e.data;"FILTERED_NETWORKS"===t&&e1(r),"CENTRALITY_RESULT"===t&&e5(r),"PROGRESS"===t&&eZ(r)}),()=>{tu.current?.terminate()}),[]),(0,a.useEffect)(()=>{b&&tu.current?.postMessage({type:"FILTER_NETWORKS",payload:{networks:b,filters:C,userName:t.name,selectedEdgeId:ei}})},[b,C,t.name,ei]),(0,a.useEffect)(()=>{if(b&&tt!==g){if(1===g)S(e=>({...e,entityType:["Person"],nationality:["Korea"],ethnicity:["Korean"]})),tr(1);else if(2===g)S(e=>({...e,entityType:["Person"],nationality:["Russia"],ethnicity:["Korean"]})),tr(2);else if(3===g){let e=b.find(e=>"Person"===e.type&&"Korean"===e.ethnicity&&e.title.includes("정재관"));e&&(S(t=>({...t,entityType:["Person"],nationality:["all"],ethnicity:["Korean"],searchQuery:"",forceIncludeNetworkIds:[e.id,...e.edges?.map(e=>e.targetId)||[]]})),tf(e.id),tw(e.id),tb(e.id),td(e,{x:e.latitude,y:e.longitude}),setTimeout(()=>{tm()},500),tr(3))}}},[g,b,tt]),(0,a.useEffect)(()=>{tu.current?.postMessage({type:"CALCULATE_CENTRALITY",payload:{filteredNetworks:e0,centralityType:T}})},[e0,T]),(0,a.useMemo)(()=>el()(e=>{eQ(e)},300),[]);let th={dots:!0,infinite:!1,speed:200,slidesToShow:1,slidesToScroll:1,initialSlide:t.isLoggedIn?11:8,appendDots:e=>(0,n.jsx)("div",{style:{position:"absolute",bottom:"-1.5rem",display:"flex",justifyContent:"center",width:"100%",padding:"0.7rem 0"},children:(0,n.jsx)("ul",{style:{margin:"0",padding:"0",display:"flex"},children:e})}),customPaging:e=>(0,n.jsxs)("div",{style:{width:"12px",height:"12px",display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"rgba(158, 157, 137, 0.8)",borderRadius:"50%",color:"#fff",fontSize:"10px",fontWeight:"bold",transition:"background-color 0.3s ease"},className:`slick-dot-${e}`,children:[e+1," "]}),afterChange:e=>{document.querySelectorAll(".slick-dots li div").forEach((t,r)=>{r===e?t.style.backgroundColor="#3e2723":t.style.backgroundColor="rgba(158, 157, 137, 0.8)"})}};(0,a.useEffect)(()=>{F&&y(F)},[F]),(0,a.useEffect)(()=>{let e=setTimeout(()=>{eJ(!1)},2e3);return()=>clearTimeout(e)},[]),(0,a.useEffect)(()=>{let e=h().layerGroup();return b&&b.length>0&&b.forEach(t=>{let{latitude:r,longitude:n,title:a}=t,o=h().marker([r,n]).bindPopup(`<b>${a}</b><br>Lat: ${r}, Lng: ${n}`);e.addLayer(o)}),()=>{e.clearLayers()}},[ey,b]);let tg=b?.flatMap(e=>e.migration_traces.filter(r=>{let n=r.migration_year>=e3[0]&&r.migration_year<=e3[1],a=!C.userNetworkTraceFilter||!t.name||e.user_name===t.name,o=C.migrationReasons.includes("all")||0===C.migrationReasons.length||C.migrationReasons.includes(r.reason);return n&&a&&o}))??[];tg.map(e=>[e.latitude,e.longitude]);let tx=(e,t,r,n)=>{let a=e=>e*Math.PI/180,o=a(r-e),i=a(n-t),l=Math.sin(o/2)**2+Math.cos(a(e))*Math.cos(a(r))*Math.sin(i/2)**2;return 2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l))*6371};tg.reduce((e,t,r)=>{if(0===r)return 0;let n=tg[r-1];return e+tx(n.latitude,n.longitude,t.latitude,t.longitude)},0);let tf=async e=>{let t=tj(e);if(t){let r="";if(!t.photo)try{let t=await N.A.get(`http://localhost:8080/networks/photo/${e}`,{responseType:"blob"});r=URL.createObjectURL(t.data)}catch(e){r=""}3!==g&&tp(t),$(t=>t&&t.id===e?null:{id:e,photo:r}),eH({x:t.latitude,y:t.longitude}),ta(n=>n.some(t=>t.id===e)?n:[...n,{id:e,position:{x:t.latitude,y:t.longitude},network:t,photo:r}])}else console.warn(`Entity with ID ${e} not found.`)},tb=e=>{en(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),S(t=>({...t,selectedMigrationNetworkIds:t.selectedMigrationNetworkIds.includes(e)?t.selectedMigrationNetworkIds.filter(t=>t!==e):[...t.selectedMigrationNetworkIds,e]}))},ty=e=>{es(t=>t===e?null:e);let t=b?.find(t=>t.edges.some(t=>t.targetId===e));t&&S(e=>({...e,forceIncludeNetworkIds:[...e.forceIncludeNetworkIds||[],t.id]}))},tw=e=>{eg(t=>t===e?null:e)},tj=e=>b?.find(t=>t.id===e)||null,tv=e=>"gray",tk=()=>{let e=[],r=r=>{(r.edges||[]).forEach(n=>{let a=!ei||n.targetId===ei,o=!eh||r.id===eh,i=C.edgeType.includes("all")||C.edgeType.includes(n.edgeType),l=Number(n.year)>=Number(C.yearRange[0])&&Number(n.year)<Number(C.yearRange[1]);if(a&&o&&i&&l){let a=b?.find(e=>e.id===n.targetId),o=!C.userNetworkConnectionFilter||!t.name||r.user_name===t.name||a&&a.user_name===t.name;a&&o&&e.push([[r.latitude,r.longitude],[a.latitude,a.longitude],tv(n.edgeType),n.strength,n.edgeType,n.year])}})};return b?.forEach(e=>{let t=new Date(`${e.migration_year}-01-01`);(C.entityType.includes("all")||C.entityType.includes(e.type))&&(C.nationality.includes("all")||C.nationality.includes(e.nationality))&&(C.ethnicity.includes("all")||C.ethnicity.includes(e.ethnicity))&&t.getFullYear()>=C.yearRange[0]&&t.getFullYear()<=C.yearRange[1]&&r(e)}),e},tN=(e,t)=>{S(r=>{let n={...r,[e]:t};return"nationality"===e&&Array.isArray(t)&&0===t.length&&(n.nationality=["all"]),"ethnicity"===e&&Array.isArray(t)&&0===t.length&&(n.ethnicity=["all"]),"edgeType"===e&&Array.isArray(t)&&0===t.length&&(n.edgeType=["all"]),"entityType"===e&&Array.isArray(t)&&0===t.length&&(n.entityType=["all"]),"migrationReasons"===e&&Array.isArray(t)&&0===t.length&&(n.migrationReasons=["all"]),n})};b&&b.filter(e=>{let r="all"===C.nationality||e.nationality===C.nationality,n="all"===C.ethnicity||e.ethnicity===C.ethnicity,a=e.migration_year>=C.yearRange[0]&&e.migration_year<=C.yearRange[1],o=!C.userNetworkFilter||!t.name||e.user_name===t.name;return r&&n&&a&&o});let tC=Array.from(new Set(b?.map(e=>e.type))).map(e=>({value:e,label:e})),tS=Array.from(new Set(b?.map(e=>e.nationality))).map(e=>({value:e,label:e})),tT=Array.from(new Set(b?.map(e=>e.ethnicity))).map(e=>({value:e,label:e})),tE=Array.from(new Set((b||[]).flatMap(e=>(e.edges||[]).map(e=>e.edgeType)))).map(e=>({value:e,label:e})),tA=Array.from(new Set(b?.flatMap(e=>e.migration_traces.map(e=>e.reason)))).map(e=>({value:e,label:e})),tI=(0,a.useMemo)(()=>ee(e0,T),[e0,T]),tz=Object.entries(tI).filter(e=>{let[t]=e;return e0.some(e=>e.id===Number(t))}).sort((e,t)=>{let[,r]=e,[,n]=t;return n-r}).slice(0,5).map(e=>{let[t,r]=e,n=e0.find(e=>e.id===Number(t));return{id:Number(t),name:String(n?n.title:"Unknown"),centrality:r}}),t$=Object.entries(b?.reduce((e,t)=>{let r=t.user_id;return e[r]||(e[r]={userName:t.user_name,networkCount:0,edgeCount:0,traceCount:0,totalScore:0}),e[r].networkCount+=1,e[r].edgeCount+=t.edges?.length||0,e[r].traceCount+=t.migration_traces?.length||0,e[r].totalScore=e[r].networkCount+e[r].edgeCount+e[r].traceCount,e},{})||{}).sort((e,t)=>{let[,r]=e,[,n]=t;return n.totalScore-r.totalScore}).slice(0,5).map((e,t)=>{let[r,n]=e;return{registrantId:Number(r),userName:n.userName,totalScore:n.totalScore,networkCount:n.networkCount,edgeCount:n.edgeCount,traceCount:n.traceCount,medal:0===t?"\uD83E\uDD47":1===t?"\uD83E\uDD48":2===t?"\uD83E\uDD49":3===t?"4️⃣":"5️⃣",display:`${n.totalScore} ${f("Points")}`}}),tR=e=>{q(e),""!==e.trim()&&G(e=>!e)},tP=async e=>{W(e);try{let t=(await N.A.get(`http://localhost:8080/networks/photo/${e}`)).data.photo;$({id:e,photo:t});let r=tj(e);r&&eH({x:r.latitude,y:r.longitude})}catch(t){console.error("Error fetching photo:",t),$({id:e,photo:""})}},tF=(0,a.useRef)([]),t_=(0,a.useRef)([]);(0,a.useEffect)(()=>{let e=tM(),t=tk(),r=JSON.stringify(tF.current)!==JSON.stringify(e),n=JSON.stringify(t_.current)!==JSON.stringify(t);(r||n)&&(tF.current=e,t_.current=t,e0&&e0.length>0&&eq(eo(e0,t,e.flat())))},[e0,C,V]);let tL=(e,t,r)=>{let n=r.filter(t=>t.network_id===e);if(!n.length)return null;let a=1/0,o=n[0];return n.forEach(e=>{let r=Math.abs(e.migration_year-t);r<a&&(a=r,o=e)}),o},tM=()=>{let e={};return b?.forEach(t=>{e[t.id]||(e[t.id]=[]),(!C.selectedMigrationNetworkIds.length||C.selectedMigrationNetworkIds.includes(t.id))&&t.migration_traces.forEach(r=>{e[t.id]||(e[t.id]=[]),r.migration_year>=e3[0]&&r.migration_year<=e3[1]&&(C.migrationReasons.includes("all")||C.migrationReasons.includes(r.reason))&&(C.entityType.includes("all")||C.entityType.includes(t.type))&&(C.nationality.includes("all")||C.nationality.includes(t.nationality))&&(C.ethnicity.includes("all")||C.ethnicity.includes(t.ethnicity))&&e[t.id].push(r)})}),Object.values(e).map(e=>e.sort((e,t)=>e.migration_year-t.migration_year).map((e,t)=>({...e,traceNumber:t+1}))).filter(e=>{let r=e.some(e=>e.migration_year>=e3[0]&&e.migration_year<=e3[1]),n=!C.userNetworkTraceFilter||!t.name||b&&e&&e[0]&&b.some(r=>r.id===e[0].network_id&&r.user_name===t.name),a=C.migrationReasons.includes("all")||0===C.migrationReasons.length||e.some(e=>C.migrationReasons.includes(e.reason));return r&&n&&a})},tD=(0,a.useMemo)(()=>tM(),[b,C,e3,er,t.name]);return((0,a.useEffect)(()=>{F&&F.length>0&&(y(F),setTimeout(()=>{S(e=>({...e,ethnicity:["Korean"]}))},0))},[F]),eX<100)?(0,n.jsx)(em,{progress:eX}):(0,n.jsxs)("div",{className:"h-[calc(87vh-64px)] relative",children:[(0,n.jsxs)("div",{className:"p-2 bg-[#d1c6b1] relative w-full",children:[x?(0,n.jsxs)(eC,{...th,children:[(0,n.jsx)("div",{children:(0,n.jsx)(O.Ay,{options:tC,onChange:e=>tN("entityType",e?e.map(e=>e.value):["all"]),value:Array.isArray(C.entityType)?tC.filter(e=>C.entityType.includes(e.value)&&"all"!==e.value):[],placeholder:f("allEntityTypes"),isClearable:!0,isMulti:!0,styles:ej,menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})}),(0,n.jsx)("div",{children:(0,n.jsx)(O.Ay,{options:tS,onChange:e=>tN("nationality",e?e.map(e=>e.value):["all"]),value:Array.isArray(C.nationality)?tS.filter(e=>C.nationality.includes(e.value)&&"all"!==e.value):[],placeholder:f("allNationalities"),isClearable:!0,isMulti:!0,styles:ej,menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})}),(0,n.jsx)("div",{children:(0,n.jsx)(O.Ay,{options:tT,onChange:e=>tN("ethnicity",e?e.map(e=>e.value):["all"]),value:Array.isArray(C.ethnicity)?C.ethnicity.filter(e=>"all"!==e&&tT.some(t=>t.value===e)).map(e=>({value:e,label:e})):[],placeholder:f("allEthnicities"),isClearable:!0,isMulti:!0,styles:ej,menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})}),(0,n.jsx)("div",{children:(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]",children:[(0,n.jsx)("label",{className:"text-sm",children:f("yearRange")}),(0,n.jsx)(ec,{value:C.yearRange,onChange:e=>tN("yearRange",e),placeholderStart:"1800",placeholderEnd:"2024"})]})}),(0,n.jsx)("div",{children:(0,n.jsx)(O.Ay,{options:tE,onChange:e=>tN("edgeType",e?e.map(e=>e.value):["all"]),placeholder:f("allConnectionTypes"),isClearable:!0,isMulti:!0,styles:ej,menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})}),(0,n.jsx)("div",{children:(0,n.jsx)(O.Ay,{options:[{value:"none",label:f("selectCentrality")},{value:"degree",label:f("degreeCentrality")},{value:"eigenvector",label:f("eigenvectorCentrality")}],onChange:e=>A(e?e.value:"none"),value:{value:T,label:f("none"===T?"selectCentrality":`${T}Centrality`)},placeholder:f("selectCentrality"),styles:ej,menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})}),(0,n.jsx)("div",{children:(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]",children:[(0,n.jsx)("label",{className:"text-sm",children:f("migrationTraceability")}),(0,n.jsx)(eu,{value:e3,onChange:e8,placeholderStart:"1800",placeholderEnd:"2024"})]})}),(0,n.jsx)("div",{children:(0,n.jsx)(O.Ay,{options:tA,onChange:e=>tN("migrationReasons",e?e.map(e=>e.value):["all"]),placeholder:f("allMigrationReasons"),isClearable:!0,isMulti:!0,styles:ej,menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})}),t.isLoggedIn&&(0,n.jsx)("div",{children:(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]",children:[(0,n.jsx)("input",{type:"checkbox",id:"userNetworkFilter",className:"w-4 h-4",checked:C.userNetworkFilter,onChange:e=>tN("userNetworkFilter",e.target.checked)}),(0,n.jsx)("label",{htmlFor:"userNetworkFilter",className:"ml-2 text-sm",children:f("filterByUserNetwork")})]})}),t.isLoggedIn&&(0,n.jsx)("div",{children:(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]",children:[(0,n.jsx)("input",{type:"checkbox",id:"userNetworkConnectionFilter",className:"w-4 h-4",checked:C.userNetworkConnectionFilter,onChange:e=>tN("userNetworkConnectionFilter",e.target.checked)}),(0,n.jsx)("label",{htmlFor:"userNetworkConnectionFilter",className:"ml-2 text-sm",children:f("filterByUserNetworkConnection")})]})}),t.isLoggedIn&&(0,n.jsx)("div",{children:(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]",children:[(0,n.jsx)("input",{type:"checkbox",id:"userNetworkTraceFilter",className:"w-4 h-4",checked:C.userNetworkTraceFilter,onChange:e=>tN("userNetworkTraceFilter",e.target.checked)}),(0,n.jsx)("label",{htmlFor:"userNetworkTraceFilter",className:"ml-2 text-sm",children:f("filterByUserNetworkTrace")})]})}),(0,n.jsx)("div",{children:(0,n.jsx)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]",children:(0,n.jsx)(ed,{onSearch:tR})})})]}):(0,n.jsxs)(eN,{isVisible:eP,children:[(0,n.jsx)(ek,{onClick:()=>{et(!J)},children:J?"2D":"3D"}),(0,n.jsx)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex flex-wrap gap-1 items-center border-2 border-[#9e9d89]",children:(0,n.jsxs)(ev,{children:[(0,n.jsx)(O.Ay,{options:tC,onChange:e=>tN("entityType",e?e.map(e=>e.value):["all"]),value:Array.isArray(C.entityType)?tC.filter(e=>C.entityType.includes(e.value)&&"all"!==e.value):[],placeholder:f("allEntityTypes"),isClearable:!0,isMulti:!0,styles:{...ej,multiValue:e=>({...e,display:"inline-flex",alignItems:"center",margin:"0 4px"}),multiValueLabel:e=>({...e,whiteSpace:"normal",overflow:"visible"}),multiValueRemove:e=>({...e,cursor:"pointer"}),menuPortal:e=>({...e,zIndex:9999})},menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"}),(0,n.jsx)(O.Ay,{options:tS,onChange:e=>tN("nationality",e?e.map(e=>e.value):["all"]),value:Array.isArray(C.nationality)?tS.filter(e=>C.nationality.includes(e.value)&&"all"!==e.value):[],placeholder:f("allNationalities"),isClearable:!0,isMulti:!0,styles:{...ej,multiValue:e=>({...e,display:"inline-flex",alignItems:"center",margin:"0 4px"}),multiValueLabel:e=>({...e,whiteSpace:"normal",overflow:"visible"}),multiValueRemove:e=>({...e,cursor:"pointer"}),menuPortal:e=>({...e,zIndex:9999})},menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"}),(0,n.jsx)(O.Ay,{options:tT,onChange:e=>tN("ethnicity",e?e.map(e=>e.value):["all"]),value:Array.isArray(C.ethnicity)?C.ethnicity.filter(e=>"all"!==e&&tT.some(t=>t.value===e)).map(e=>({value:e,label:e})):[],placeholder:f("allEthnicities"),isClearable:!0,isMulti:!0,styles:{...ej,multiValue:e=>({...e,display:"inline-flex",alignItems:"center",margin:"0 4px"}),multiValueLabel:e=>({...e,whiteSpace:"normal",overflow:"visible"}),multiValueRemove:e=>({...e,cursor:"pointer"}),menuPortal:e=>({...e,zIndex:9999})},menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})]})}),(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]",children:[(0,n.jsx)("label",{className:"text-sm",children:f("yearRange")}),(0,n.jsx)(ec,{value:C.yearRange,onChange:e=>tN("yearRange",e),placeholderStart:"1800",placeholderEnd:"2024"}),(0,n.jsx)(O.Ay,{options:tE,onChange:e=>tN("edgeType",e?e.map(e=>e.value):["all"]),value:Array.isArray(C.edgeType)?C.edgeType.filter(e=>"all"!==e).map(e=>({value:e,label:e})):[],placeholder:f("allConnectionTypes"),isClearable:!0,isMulti:!0,styles:{...ej,multiValue:e=>({...e,display:"inline-flex",alignItems:"center",margin:"0 4px"}),multiValueLabel:e=>({...e,whiteSpace:"normal",overflow:"visible"}),multiValueRemove:e=>({...e,cursor:"pointer"}),menuPortal:e=>({...e,zIndex:9999})},menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"}),t.isLoggedIn?(0,n.jsx)(O.Ay,{options:[{value:"none",label:f("selectCentrality")},{value:"degree",label:f("degreeCentrality")},{value:"eigenvector",label:f("eigenvectorCentrality")}],onChange:e=>A(e?e.value:"none"),value:{value:T,label:f("none"===T?"selectCentrality":`${T}Centrality`)},placeholder:f("selectCentrality"),styles:{...ej,multiValue:e=>({...e,display:"inline-flex",alignItems:"center",margin:"0 4px"}),multiValueLabel:e=>({...e,whiteSpace:"normal",overflow:"visible"}),multiValueRemove:e=>({...e,cursor:"pointer"}),menuPortal:e=>({...e,zIndex:9999})},menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"}):(0,n.jsx)(n.Fragment,{})]}),(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]",children:[(0,n.jsx)("label",{className:"text-sm",children:f("migrationTraceability")}),(0,n.jsx)(eu,{value:e3,onChange:e8,placeholderStart:"1800",placeholderEnd:"2024"}),(0,n.jsx)(O.Ay,{options:tA,onChange:e=>tN("migrationReasons",e?e.map(e=>e.value):["all"]),placeholder:f("allMigrationReasons"),isClearable:!0,isMulti:!0,styles:{...ej,multiValue:e=>({...e,display:"inline-flex",alignItems:"center",margin:"0 4px"}),multiValueLabel:e=>({...e,whiteSpace:"normal",overflow:"visible"}),multiValueRemove:e=>({...e,cursor:"pointer"}),menuPortal:e=>({...e,zIndex:9999})},menuPortalTarget:document.body,menuPlacement:"auto",menuPosition:"fixed",className:"p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"})]}),(0,n.jsxs)("div",{className:"p-1 border rounded bg-[#d1c6b1] flex gap-0.5 items-center border-2 border-[#9e9d89]",children:[t.isLoggedIn?(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("div",{className:"ml-1 flex items-center gap-0.5",children:[(0,n.jsx)("input",{type:"checkbox",id:"userNetworkFilter",className:"w-2 h-2",checked:C.userNetworkFilter,defaultChecked:!1,onChange:e=>tN("userNetworkFilter",e.target.checked)}),(0,n.jsx)("label",{htmlFor:"userNetworkFilter",className:"text-xs",children:f("filterByUserNetwork")})]}),(0,n.jsxs)("div",{className:"ml-1 flex items-center gap-0.5",children:[(0,n.jsx)("input",{type:"checkbox",id:"userNetworkConnectionFilter",className:"w-2 h-2",checked:C.userNetworkConnectionFilter,defaultChecked:!1,onChange:e=>tN("userNetworkConnectionFilter",e.target.checked)}),(0,n.jsx)("label",{htmlFor:"userNetworkConnectionFilter",className:"text-xs",children:f("filterByUserNetworkConnection")})]}),(0,n.jsxs)("div",{className:"ml-1 flex items-center gap-0.5",children:[(0,n.jsx)("input",{type:"checkbox",id:"userNetworkTraceFilter",className:"w-2 h-2",checked:C.userNetworkTraceFilter,defaultChecked:!1,onChange:e=>tN("userNetworkTraceFilter",e.target.checked)}),(0,n.jsx)("label",{htmlFor:"userNetworkTraceFilter",className:"text-xs",children:f("filterByUserNetworkTrace")})]})]}):(0,n.jsx)(n.Fragment,{}),(0,n.jsx)(ed,{onSearch:tR})]})]}),Q&&U&&(0,n.jsx)("div",{className:`flex justify-end absolute w-full z-10 ${Q?"block":"hidden"}`,style:{top:"4rem",right:"0",opacity:.8*!!Q,pointerEvents:"none"},children:(0,n.jsx)("div",{className:"bg-white shadow rounded p-4 border border-gray-300 max-h-80 overflow-y-auto",style:{maxWidth:window.innerWidth<=768?"90%":"30%",marginRight:"1rem",position:"relative",backgroundColor:"rgba(255, 255, 255, 0.8)",pointerEvents:"auto"},children:(0,n.jsx)(D,{searchQuery:U,setFocusedNode:P,handleEntityClick:tf,handleMigrationTraceClick:tb,handleEdgeClick:ty,handleNetworkEdgesToggle:tw})})})]}),J?(0,n.jsx)(X,{networks:b,filters:C,filteredNetworks:e0,filteredTraces:tg,filteredEdges:(()=>{let e=[];return b?.forEach(t=>{(t.edges||[]).forEach(r=>{let n=C.edgeType.includes("all")||C.edgeType.includes(r.edgeType),a=Number(r.year)>=Number(C.yearRange[0])&&Number(r.year)<=Number(C.yearRange[1]);if(n&&a){let n=b.find(e=>e.id===r.targetId);n&&e.push({startLat:t.latitude,startLon:t.longitude,endLat:n.latitude,endLon:n.longitude,edgeType:r.edgeType,year:r.year})}})}),e})(),handleEdgeClick:ty,handleNetworkEdgesToggle:tw}):(0,n.jsxs)(i.W,{center:[40,130],zoom:5,zoomControl:!1,style:{height:"calc(100vh - 64px - 64px)",width:"100%",position:"relative",zIndex:0},maxBounds:[[90,-360],[-90,360]],maxBoundsViscosity:1.2,minZoom:3,children:[(0,n.jsx)(()=>((0,o.Po)({contextmenu(e){L(e.latlng)}}),null),{}),(0,n.jsx)(()=>((0,o.Po)({click:e=>{e.originalEvent.target instanceof HTMLElement&&e.originalEvent.target.closest(".legend-container")||$(null)}}),null),{})," ",_&&(0,n.jsx)(l.p,{position:_,children:(0,n.jsx)(s.z,{children:(0,n.jsxs)("div",{style:{textAlign:"center"},children:[(0,n.jsxs)("p",{style:{marginBottom:"10px"},children:[(0,n.jsx)("strong",{children:"Lat:"})," ",_.lat]}),(0,n.jsxs)("p",{style:{marginBottom:"20px"},children:[(0,n.jsx)("strong",{children:"Lng:"})," ",_.lng]}),(0,n.jsx)("button",{className:"copy-btn","data-clipboard-text":`${_.lat}, ${_.lng}`,onClick:()=>{_&&(Y({id:0,user_id:0,title:"",type:"Person",nationality:"",ethnicity:"",migration_year:0,end_year:0,latitude:_.lat,longitude:_.lng,migration_traces:[],connections:[{targetType:"Person",targetId:0,strength:0,type:"",year:0}],edge:[]}),new(z())(".copy-btn",{text:()=>`${_.lat}, ${_.lng}`}).on("success",()=>{B(!0),setTimeout(()=>B(!1),2e3)}))},style:{padding:"10px 20px",fontSize:"16px",backgroundColor:M?"green":"#007BFF",color:"#fff",border:"none",borderRadius:"5px",cursor:"pointer",transition:"background-color 0.3s ease"},children:M?(0,n.jsx)("span",{children:"Copied!"}):"Copy"})]})})}),R&&(0,n.jsx)(eb,{lat:R.lat,lng:R.lng,zoom:e7}),(0,n.jsx)("button",{onClick:()=>{eD(!eM)},style:{position:"absolute",top:"0rem",left:"0rem",zIndex:2e3,backgroundColor:"#3e2723",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 12px",cursor:"pointer"},children:eM?"-":"+"}),(0,n.jsx)("button",{onClick:()=>{eL(!e_)},style:{position:"absolute",top:"0rem",right:"0rem",zIndex:2e3,backgroundColor:"#3e2723",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 12px",cursor:"pointer"},children:e_?"-":"+"}),eM&&(0,n.jsxs)(ew,{children:[(0,n.jsx)("h2",{children:f("topRegistrants")}),(0,n.jsxs)("div",{style:{fontSize:"0.7rem",color:"#4b1e22",marginBottom:"0.2rem",fontWeight:"bold",textAlign:"center"},children:[f("Score"),"(",f("Node"),"+",f("Edge"),"+",f("Mobility"),")"]}),(0,n.jsx)("ul",{children:t$.map(e=>(0,n.jsxs)("div",{children:[e.medal," ",e.userName," : ",e.display]},e.registrantId))})]}),e_&&(0,n.jsx)(ea,{topNetworks:tz,onEntityClick:tf,centralityType:T,networkAnalysis:eU}),(0,n.jsx)("button",{onClick:()=>{eW(e=>!e)},style:{position:"absolute",top:"2rem",right:"0rem",zIndex:2e3,backgroundColor:"#3e2723",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 12px",cursor:"pointer"},children:eY?"-":"+"}),(0,n.jsx)("button",{onClick:()=>{eB(e=>!e)},style:{position:"absolute",top:"4rem",right:"0rem",zIndex:2e3,backgroundColor:"#3e2723",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 12px",cursor:"pointer"},children:eO?"-":"+"}),(0,n.jsx)(d.e,{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:'\xa9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),tn.map(e=>(0,n.jsxs)(v,{onClose:()=>tc(e.id),children:[(0,n.jsxs)(eS,{children:[(0,n.jsxs)("strong",{className:"text-lg font-semibold block mb-2",children:["No.",e.network.id," : ",e.network.title]}),(0,n.jsxs)("div",{className:"text-gray-700 text-sm space-y-1",children:[e.photo&&(0,n.jsx)("div",{className:"flex justify-center mb-2",children:(0,n.jsx)("img",{src:e.photo,alt:"Network",className:"w-24 h-24 object-cover rounded-lg shadow-md"})}),(0,n.jsxs)(eA,{children:[(0,n.jsx)(eI,{onClick:()=>tw(e.network.id),active:eh===e.network.id,title:f("Show only this network's connections"),style:{background:"#fff3e0",color:"#e65100",border:"1.5px solid #ffe0b2"},children:eh===e.network.id?` ${f("Connections")}-${e.network.title.length>8?e.network.title.slice(0,8)+"…":e.network.title}`:f("All Connections")}),(0,n.jsx)(eI,{onClick:()=>tb(e.network.id),active:er.includes(e.network.id),title:f("Show only this network's migrations"),style:{background:"#e3f2fd",color:"#1976d2",border:"1.5px solid #bbdefb"},children:er.includes(e.network.id)?`${f("Mobility")}-${e.network.title.length>8?e.network.title.slice(0,8)+"…":e.network.title} `:f("All Mobility")})]}),(0,n.jsxs)("p",{children:[(0,n.jsxs)("span",{className:"font-medium",children:[f("Creator Name"),":"]})," ",e.network.user_name]}),(0,n.jsxs)("p",{children:[(0,n.jsxs)("span",{className:"font-medium",children:[f("Type"),":"]})," ",e.network.type]}),(0,n.jsxs)("p",{children:[f("Centrality"),": ",tI[e.network.id]||0]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("span",{className:"font-medium",children:f("Nationality")})," ",e.network.nationality]}),(0,n.jsxs)("p",{children:[(0,n.jsxs)("span",{className:"font-medium",children:[f("Ethnicity"),":"]})," ",e.network.ethnicity]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("span",{className:"font-medium",children:"Person"===e.network.type?f("Birth Year"):f("Established Year")}),(0,n.jsxs)("span",{className:"font-medium",children:[": ",e.network.migration_year]})]}),(0,n.jsxs)("p",{children:[(0,n.jsx)("span",{className:"font-medium",children:"Person"===e.network.type?f("Death Year"):f("Dissolved Year")}),(0,n.jsxs)("span",{className:"font-medium",children:[": ",e.network.end_year]})]}),(0,n.jsxs)("p",{children:[(0,n.jsxs)("span",{className:"font-medium",children:[f("Latitude"),":"]})," ",e.network.latitude.toFixed(5)]}),(0,n.jsxs)("p",{children:[(0,n.jsxs)("span",{className:"font-medium",children:[f("Longitude"),":"]})," ",e.network.longitude.toFixed(5)]})]}),(0,n.jsxs)("div",{style:{margin:"1rem 0"},children:[(0,n.jsx)("button",{onClick:()=>ti(e=>!e),style:{background:"#e3f2fd",color:"#1976d2",border:"none",borderRadius:"6px",padding:"0.5em 1.2em",fontWeight:600,fontSize:"1.05em",cursor:"pointer",marginBottom:"0.3em",boxShadow:"0 1px 3px rgba(0, 0, 0, 0.1)",transition:"background 0.2s, color 0.2s"},children:f("Mobility")}),(0,n.jsx)(ez,{open:to,children:(0,n.jsxs)(e$,{children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{children:f("No.")}),(0,n.jsx)("th",{children:f("Year")}),(0,n.jsx)("th",{children:f("Place")}),(0,n.jsx)("th",{children:f("Reason")})]})}),(0,n.jsx)("tbody",{children:e.network.migration_traces.sort((e,t)=>e.migration_year-t.migration_year).map((e,t)=>(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:t+1}),(0,n.jsx)("td",{children:e.migration_year}),(0,n.jsx)("td",{children:e.location_name}),(0,n.jsx)("td",{children:e.reason})]},e.id))})]})})]}),(0,n.jsxs)("div",{style:{margin:"1rem 0"},children:[(0,n.jsx)("button",{onClick:()=>ts(e=>!e),style:{background:"#fff3e0",color:"#e65100",border:"none",borderRadius:"6px",padding:"0.5em 1.2em",fontWeight:600,fontSize:"1.05em",cursor:"pointer",marginBottom:"0.3em",boxShadow:"0 1px 3px rgba(255,152,0,0.07)",transition:"background 0.2s, color 0.2s"},children:f("Connections")}),(0,n.jsx)(ez,{open:tl,children:(0,n.jsxs)(eR,{children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{children:f("Type")}),(0,n.jsx)("th",{children:f("Target")}),(0,n.jsx)("th",{children:f("Year")}),(0,n.jsx)("th",{children:f("Strength")})]})}),(0,n.jsx)("tbody",{children:e.network.edges?.map((e,t)=>{let r=b?.find(t=>t.id===e.targetId);return(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:e.edgeType}),(0,n.jsx)("td",{children:r?r.title:e.targetId}),(0,n.jsx)("td",{children:e.year}),(0,n.jsx)("td",{children:e.strength})]},t)})})]})})]}),(0,n.jsxs)("div",{className:"mt-2 mb-2 border rounded text-xs",style:{backgroundColor:"rgba(33, 150, 243, 0.18)",borderColor:"#90caf9"},children:[(0,n.jsxs)("b",{children:["\uD83D\uDCA1 ",f("Smilarity Insight")]}),(0,n.jsx)(eT,{children:(function(e,t){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:3,n=ep(e),a=new Set((e.connections||[]).map(e=>e.targetId));return t.filter(t=>t.id!==e.id&&!a.has(t.id)).map(e=>{var t;let r;return{network:e,score:(t=ep(e),r=0,n.nationality&&n.nationality===t.nationality&&(r+=1),n.ethnicity&&n.ethnicity===t.ethnicity&&(r+=1),n.type&&n.type===t.type&&(r+=1),n.migrationYear&&t.migrationYear&&5>=Math.abs(n.migrationYear-t.migrationYear)&&(r+=1),r)}}).filter(e=>e.score>0).sort((e,t)=>t.score-e.score).slice(0,r).map(e=>e.network)})(e.network,e0,3).map(e=>(0,n.jsxs)(eE,{title:e.title,onClick:()=>{tP(e.id),tw(e.id),tb(e.id);let t=tj(e.id);t&&3!==g&&tp(t)},style:{cursor:"pointer"},children:[(0,n.jsx)("span",{className:"item-title",children:e.title}),(0,n.jsxs)("span",{className:"item-meta",children:["(",e.type,", ",e.nationality,", ",e.ethnicity,")"]})]},e.id))})]}),(0,n.jsx)(ex,{originId:e.network.id,originTitle:e.network.title,migrationPath:e.network.migration_traces.map(e=>({year:e.migration_year,place:e.location_name,reason:e.reason})),networkSummary:`
이 네트워크의 주요 인물과 단체, 그리고 이들 사이의 관계는 다음과 같습니다:

이 네트워크의 관계망 스토리를 3문장으로 요약해줘.
`,edges:e.network.edges?.map(e=>{let t=b?.find(t=>t.id===e.targetId);return{targetId:e.targetId,targetTitle:t?t.title:"",year:e.year,edgeType:e.edgeType}})??[]})]}),(0,n.jsx)("div",{className:"max-h-32 max-w-full overflow-y-auto border-t pt-2",style:{width:"100%",maxHeight:"200px",marginTop:"16px"},children:(0,n.jsx)(K,{networkId:e.network.id})})]},e.id)),(0,n.jsx)(()=>((0,o.Po)({click(e){eH({x:e.containerPoint.x,y:e.containerPoint.y})}}),null),{}),tD.map(e=>e.map(t=>{let r=b?.find(e=>e.id===t.network_id);r&&r.title;let a=14+1.3*t.traceNumber;return e.some(e=>e.id!==t.id&&e.latitude===t.latitude&&e.longitude===t.longitude)?null:(0,n.jsx)(l.p,{position:[t.latitude,t.longitude],icon:h().divIcon({className:"custom-trace-marker",html:`<div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${a}px;
            height: ${a}px;
            background-color: #FF5722;
            color: white;
            border-radius: 50%;
            font-size: ${a/1.2}px;
            font-weight: bold;
            border: 2px solid #BF360C;">
            ${t.traceNumber}
          </div>`}),eventHandlers:{click:()=>{let e=b?.find(e=>e.id===t.network_id);e&&td(e,{x:t.latitude,y:t.longitude})}},children:eO&&(0,n.jsx)(c.m,{permanent:!0,direction:"top",offset:[0,-12],className:"custom-tooltip",opacity:.7,children:(0,n.jsxs)("div",{style:{textAlign:"center",fontSize:x?"14px":"16px",fontWeight:"bold",color:"#3E2723"},children:[t.reason," (",t.migration_year,")"]})})},t.id)})),tD.map(e=>e.slice(0,-1).map((t,r)=>{let a=e[r+1];return t.network_id!==a.network_id?null:(0,n.jsx)(u.R,{positions:[[t.latitude,t.longitude],[a.latitude,a.longitude]],color:"#1976d2",weight:3,opacity:.7,dashArray:"5, 5",lineCap:"round",lineJoin:"round",eventHandlers:{click:e=>{h().popup().setLatLng(e.latlng).setContent(`<div>
                      <strong>{t("Network ID")}:</strong> ${a.network_id}<br/>
                      <strong>{t("Migration Year")}:</strong> ${a.migration_year}<br/>
                      <strong>{t("Location")}:</strong> ${a.location_name}<br/>
                      <strong>{t("Reason")}:</strong> ${a.reason}
                    </div>`).openOn(e.target._map)}}},`${t.id}-${a.id}`)})),tD.map(e=>e.slice(0,-1).map((t,r)=>{let a=e[r+1];return t&&a&&t.latitude&&t.longitude&&a.latitude&&a.longitude?(0,n.jsx)(Z,{traces:tD.flat()}):(console.warn("Invalid trace data:",{trace:t,nextTrace:a}),null)})),e0.filter(e=>!eh||e.id===eh).flatMap(e=>Array.isArray(e.edges)?e.edges.map((t,r)=>{let a=tD.flat(),o=tL(e.id,t.year,a),i=tL(t.targetId,t.year,a);if(!o||!i)return null;let l=[[o.latitude,o.longitude],[i.latitude,i.longitude]],s=Math.max(1,Math.min(5,2*t.strength));return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(u.R,{positions:[[o.latitude,o.longitude],[i.latitude,i.longitude]],color:"#e65100",weight:s,dashArray:"5, 5",eventHandlers:{click:r=>{h().popup().setLatLng(r.latlng).setContent(`<div>
                            <strong>${f("Connections")}</strong><br/>
                            ${f("Source")}: ${e.title}<br/>
                            ${f("Target")}: ${b?.find(e=>e.id===t.targetId)?.title||t.targetId}<br/>
                            ${f("Year")}: ${t.year}<br/>
                            ${f("Type")}: ${f(t.edgeType)}<br/>
                            ${f("Strength")}: ${t.strength}
                          </div>`).openOn(r.target._map)}},children:eY&&(0,n.jsx)(c.m,{permanent:!0,direction:"center",opacity:.7,children:(0,n.jsxs)("span",{children:[f(t.edgeType)," (",t.strength,", ",t.year,")"]})})},`edge-trace-${e.id}-${t.targetId}-${t.year}-${r}`),(0,n.jsx)(ef,{positions:l,patterns:[{offset:"50%",repeat:0,symbol:h().Symbol.arrowHead({pixelSize:5+s,polygon:!0,pathOptions:{color:"#FF0000",fillOpacity:1,weight:s}})}]})]})}):[])]})]})},ew=f.Ay.div`
  position: absolute;
  top: 0.5rem; /* 맵 상단에 더 가깝게 */
  left: 1.4rem; /* 맵 왼쪽에 더 가깝게 */
  width: 10rem; /* 박스 너비를 더 작게 */
  background-color: rgba(255, 255, 255, 0.7);
  padding: 7px; /* 패딩을 줄임 */
  border: 1px solid #ccc;
  border-radius: 0.5rem; /* 둥근 모서리 크기 축소 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 그림자 크기 축소 */
  z-index: 1000;
  font-size: 0.7rem; /* 기본 글자 크기 축소 */
  h2 {
    font-size: 0.9rem; /* 제목 글자 크기 축소 */
    margin-bottom: 0.2rem; /* 제목 아래 여백 축소 */
    text-align: center;
    font-weight: bold;
  }
  ul {
    font-size: 0.8rem; /* 리스트 글자 크기 축소 */
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    margin-bottom: 0.2rem; /* 리스트 항목 간격 축소 */
  }
  @media (max-width: 768px) {
    width: 8rem; /* 모바일에서 박스 너비 축소 */
    font-size: 0.6rem; /* 글자 크기 더 축소 */
    h2 {
      font-size: 0.8rem; /* 제목 글자 크기 더 축소 */
      font-weight: bold;
    }
    ul {
      font-size: 0.7rem; /* 리스트 글자 크기 더 축소 */
    }
  }
  @media (max-width: 480px) {
    width: 7rem; /* 더 작은 화면에서 박스 너비 축소 */
    font-size: 0.35rem; /* 글자 크기 더 축소 */
    h2 {
      font-size: 0.65rem; /* 제목 글자 크기 더 축소 */
    }
    ul {
      font-size: 0.6rem; /* 리스트 글자 크기 더 축소 */
    }
  }
`,ej={control:(e,t)=>({...e,display:"flex",flexWrap:"nowrap",overflowX:"auto",overflowY:"auto",boxShadow:t.isFocused?"0 0 0 2px rgba(251, 191, 36, 1)":e.boxShadow,borderColor:t.isFocused?"rgba(251, 191, 36, 1)":e.borderColor,"&:hover":{borderColor:t.isFocused?"rgba(251, 191, 36, 1)":e.borderColor},borderRadius:"0.375rem",minWidth:"120px",maxWidth:"100%"}),multiValue:e=>({...e,display:"inline-flex",alignItems:"center",margin:"0 4px"}),multiValueLabel:e=>({...e,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}),multiValueRemove:e=>({...e,cursor:"pointer"}),menuPortal:e=>({...e,zIndex:9999})},ev=f.Ay.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 데스크톱에서는 6열 고정 */
  gap: 0.2rem; /* 버튼 간격을 줄임 */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 모바일에서 2열로 변경 */
    gap: 0.1rem; /* 모바일에서 간격을 더 줄임 */
  }
`,ek=f.Ay.button`
  display: none; /* 기본적으로 숨김 */
  @media (min-width: 768px) {
    display: inline-block; /* 데스크톱에서는 표시 */
  }
  padding: 0.3rem 0.8rem; /* 버튼 패딩을 줄임 */
  background-color: #3e2723;
  color: white;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 0.8rem; /* 글자 크기를 줄임 */
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #5d4037;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3e2723;
  }
`,eN=f.Ay.div`
  display: flex;
  max-height: 5rem; /* 최대 높이 설정 */
  gap: 0.3rem; /* 버튼 간격을 줄임 */
  overflow-x: auto;
  overflow-y: auto;
  padding: 0.3rem; /* 상하 패딩을 줄임 */
  background-color: #d1c6b1;
  border-radius: 0.375rem;
  transition: transform 0.3s ease-in-out; /* 애니메이션 효과 */
  transform: ${e=>{let{isVisible:t}=e;return t?"translateY(0)":"translateY(-100%)"}}; /* 위로 숨기기 */
  position: relative;
  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    height: 6px; /* 스크롤바 높이를 줄임 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: #9e9d89;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
  @media (max-width: 768px) {
    display: block; /* 모바일에서는 캐러셀로 변경 */
  }
`,eC=(0,f.Ay)(er.A)`
  .slick-dots {
    bottom: -20px; /* 도트 위치를 아래로 조정 */
  }
  .slick-dots li button:before {
    font-size: 10px; /* 도트 크기 조정 */
    color: #9e9d89; /* 도트 색상 */
  }
  .slick-dots li.slick-active button:before {
    color: #3e2723; /* 활성화된 도트 색상 */
  }
`,eS=f.Ay.div`
  width: 110%; /* 팝업 너비 */
  max-height: 80%; /* 팝업 최대 높이 */
  font-size: 14px;
  background: rgba(241, 245, 249, 0.6); /* 약간의 투명도 추가 */
  padding: 2rem;
  overflow-y: auto;
  z-index: 2000;
  margin: -1rem -1rem;
  h2 {
    font-size: 16px;
    font-weight: bold;
    color: #3e2723; /* 제목 색상 */
    margin-bottom: 8px;
  }
  p {
    font-size: 0.8rem;
    color: #1f2937; /* 텍스트 색상 */
    margin-bottom: 0.2rem;
  }
  .popup-image {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 50%;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }
  }
  @media (max-width: 768px) {
    width: 100%;
    max-height: 350px;
    font-size: 12px;
  }
  @media (max-width: 480px) {
    width: 100%;
    max-height: 250px;
    font-size: 10px;
  }
`;f.Ay.div`
  max-height: calc(100%); /* 팝업 내부에서 꽉 차도록 설정 */
  border-radius: 8px;
  width: 100%; /* 팝업 콘텐츠와 동일한 너비 */
  background: #f9fafb; /* 팝업과 동일한 배경색 */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  font-color: #111827 .comment-input {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s;
      &:focus {
        border-color: #3e2723;
        box-shadow: 0 0 0 2px rgba(62, 39, 35, 0.2);
      }
    }
    button {
      padding: 8px 16px;
      background-color: #3e2723;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s;
      &:hover {
        background-color: #5d4037;
      }
    }
  }
  .comment-list {
    max-height: calc(100%); /* 코멘트 리스트가 꽉 차도록 설정 */
    overflow-y: auto;
    li {
      background: #ffffff;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0px 2px 4px rgba(62, 39, 35, 0.2);
      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #5d4037;
        margin-bottom: 4px;
        .comment-user {
          font-weight: bold;
        }
        .comment-date {
          font-size: 11px;
          color: #9e9e9e;
        }
      }
      .comment-content {
        font-size: 12px;
        color: #3e2723;
      }
    }
  }
  @media (max-width: 768px) {
    max-height: calc(100% - 2rem);
    padding: 8px;
  }
  @media (max-width: 480px) {
    max-height: calc(100% - 1.5rem);
    font-size: 10px;
    padding: 5px;
  }
`;let eT=f.Ay.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0.2rem 0.2rem 0.2rem; // 상단, 좌우, 하단 패딩 추가
  margin: 0;
  list-style: none;
`,eE=f.Ay.li`
  flex: 1 1 30%;
  min-width: 180px;
  max-width: 320px;
  background: #fff8e1;
  border: 1px solid #ffe0b2;
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  font-size: 0.98em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  .item-title {
    flex: 1;
    min-width: 0;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    color: #3e2723;
    padding-right: 0.3em;
  }
  .item-meta {
    margin-left: 0.5em;
    font-size: 0.85em;
    color: #8d6e63;
    flex-shrink: 0;
  }
`,eA=f.Ay.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.7rem 0 0.5rem 0;
  justify-content: flex-end;
`,eI=f.Ay.button`
  padding: 0.32rem 0.7rem;
  font-size: 0.92em;
  border-radius: 7px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.3rem;
  transition:
    background 0.2s,
    color 0.2s;
  background: ${e=>{let{active:t}=e;return t?"#e3f2fd":"#fff3e0"}};
  color: ${e=>{let{active:t}=e;return t?"#1976d2":"#e65100"}};
  box-shadow: 0 1px 3px
    ${e=>{let{active:t}=e;return t?"rgba(33,150,243,0.07)":"rgba(255,152,0,0.07)"}};
  &:hover {
    background: ${e=>{let{active:t}=e;return t?"#bbdefb":"#ffe0b2"}};
    color: ${e=>{let{active:t}=e;return t?"#1565c0":"#ff9800"}};
  }
`,ez=f.Ay.div`
  max-height: ${e=>{let{open:t}=e;return t?"600px":"0"}};
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${e=>{let{open:t}=e;return+!!t}};
  transform: translateY(${e=>{let{open:t}=e;return t?"0":"-10px"}});
  transition-property: max-height, opacity, transform;
  margin-bottom: ${e=>{let{open:t}=e;return t?"1rem":"0"}};
`,e$=f.Ay.table`
  width: 100%;
  font-size: 1rem;
  margin-top: 0.7rem;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.07);
  th,
  td {
    padding: 0.7em 0.6em;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
  }
  th {
    background: #e3f2fd;
    color: #1976d2;
    font-size: 1.08em;
    font-weight: 600;
  }
  tr:last-child td {
    border-bottom: none;
  }
  td {
    color: #3e2723;
    font-size: 0.98em;
  }
`,eR=f.Ay.table`
  width: 100%;
  font-size: 1rem;
  margin-top: 0.7rem;
  border-collapse: collapse;
  background: #fff8e1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.08);
  th,
  td {
    padding: 0.7em 0.6em;
    border-bottom: 1px solid #ffe0b2;
    text-align: center;
  }
  th {
    background: #ffe0b2;
    color: #e65100;
    font-size: 1.08em;
    font-weight: 600;
  }
  tr:last-child td {
    border-bottom: none;
  }
  td {
    color: #e65100;
    font-size: 0.98em;
  }
`,eP=ey}}]);