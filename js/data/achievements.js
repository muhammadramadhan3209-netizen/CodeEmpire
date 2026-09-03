export const achievementDefs=[
  {id:"first_client",name:"First Contract",description:"Selesaikan satu pekerjaan client.",category:"legit",condition:state=>state.clientRating.count>=1,reward:{money:500,xp:50,badge:"Trusted Starter"}},
  {id:"five_star",name:"Perfect Delivery",description:"Dapatkan rating client 5 bintang.",category:"legit",condition:state=>state.clientRating.history.some(item=>item.rating===5),reward:{money:1500,xp:100,badge:"Five-Star Dev"}},
  {id:"client_veteran",name:"Client Veteran",description:"Selesaikan 10 pekerjaan client.",category:"legit",condition:state=>state.clientRating.count>=10,reward:{money:5000,xp:250,badge:"Agency Pro"}},
  {id:"shadow_entry",name:"Shadow Entry",description:"Selesaikan job hacking pertama.",category:"hacking",condition:state=>state.hacker.completedJobs>=1,reward:{money:750,xp:60,badge:"Silent Packet"}},
  {id:"ghost_operator",name:"Ghost Operator",description:"Capai 25 Dark Rep.",category:"hacking",condition:state=>state.hacker.darkRep>=25,reward:{money:3000,xp:180,badge:"Ghost"}},
  {id:"clean_escape",name:"Clean Escape",description:"Selesaikan 5 job tanpa tertangkap.",category:"hacking",condition:state=>state.hacker.completedJobs>=5&&state.hacker.caught===0,reward:{money:4000,xp:220,badge:"Untouchable"}},
  {id:"growing_team",name:"Growing Team",description:"Rekrut 5 karyawan.",category:"growth",condition:state=>state.team.length>=5,reward:{money:2500,xp:150,badge:"Team Builder"}},
  {id:"product_launch",name:"Launch Day",description:"Rilis produk pertama.",category:"growth",condition:state=>state.products.length>=1,reward:{money:3000,xp:200,badge:"Product Founder"}},
  {id:"level_twenty",name:"Tech Leader",description:"Capai level pemain 20.",category:"growth",condition:state=>state.level>=20,reward:{money:10000,xp:500,badge:"Tech Leader"}},
  {id:"grey_balance",name:"Grey Balance",description:"Capai minimal 10 Clean Rep dan Dark Rep dengan selisih maksimal 5.",category:"dual",condition:state=>state.hacker.cleanRep>=10&&state.hacker.darkRep>=10&&Math.abs(state.hacker.cleanRep-state.hacker.darkRep)<=5,reward:{money:6000,xp:300,badge:"Grey Architect"}}
];
