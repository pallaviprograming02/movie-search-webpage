const qEl = document.getElementById('q');
const btn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const useApiEl = document.getElementById('useApi');
const apiKeyEl = document.getElementById('apiKey');

// Sample local dataset used when OMDb isn't enabled or no key provided.
const SAMPLE = [
  {Title:'Inception',Year:'2010',imdbID:'tt1375666',Type:'movie',Poster:'https://m.media-amazon.com/images/I/51s+6Dg6fCL._AC_.jpg',Plot:'A thief who steals corporate secrets through dream-sharing technology.'},
  {Title:'Interstellar',Year:'2014',imdbID:'tt0816692',Type:'movie',Poster:'https://m.media-amazon.com/images/I/91kFYg4fX3L._SL1500_.jpg',Plot:'A team of explorers travel through a wormhole in space.'},
  {Title:'The Matrix',Year:'1999',imdbID:'tt0133093',Type:'movie',Poster:'https://m.media-amazon.com/images/I/51EG732BV3L.jpg',Plot:'A hacker learns about the true nature of reality.'},
  {Title:'The Dark Knight',Year:'2008',imdbID:'tt0468569',Type:'movie',Poster:'https://m.media-amazon.com/images/I/51k0qa6qMXL.jpg',Plot:'Batman sets out to dismantle organized crime in Gotham.'},
  {Title:'Pulp Fiction',Year:'1994',imdbID:'tt0110912',Type:'movie',Poster:'https://m.media-amazon.com/images/I/51V5ZpFyaFL.jpg',Plot:'The lives of two mob hitmen intertwine in tales of violence.'},
  {Title:'Toy Story',Year:'1995',imdbID:'tt0114709',Type:'movie',Poster:'https://m.media-amazon.com/images/I/71ZfC1cG1PL._SL1180_.jpg',Plot:'Toys come to life when humans are not around.'},
  {Title:'Guardians of the Galaxy',Year:'2014',imdbID:'tt2015381',Type:'movie',Poster:'https://m.media-amazon.com/images/I/71fX6Q5rKGL._SL1000_.jpg',Plot:'A group of intergalactic criminals must pull together to stop a fanatical warrior.'},
  {Title:'The Shawshank Redemption',Year:'1994',imdbID:'tt0111161',Type:'movie',Poster:'https://m.media-amazon.com/images/I/51NiGlapXlL.jpg',Plot:'Two imprisoned men bond over a number of years, finding solace.'}
];

function renderResults(list){
  resultsEl.innerHTML='';
  if(!list || list.length===0){
    statusEl.textContent='No results.';
    return;
  }
  statusEl.textContent='';
  list.forEach(m=>{
    const card = document.createElement('article');card.className='card';
    const img = document.createElement('img');img.className='poster';img.alt = m.Title + ' poster';img.src = (m.Poster && m.Poster!=='N/A')?m.Poster:'https://via.placeholder.com/72x108?text=No+Image';
    const meta = document.createElement('div');meta.className='meta';
    const h = document.createElement('h3');h.className='title';h.textContent = m.Title;
    const sub = document.createElement('div');sub.className='subtitle';sub.textContent = `${m.Year} • ${m.Type}`;
    const p = document.createElement('div');p.className='plot';p.textContent = m.Plot || '';
    const footer = document.createElement('div');footer.className='footer';
    const idpill = document.createElement('div');idpill.className='pill';idpill.textContent = m.imdbID || '';
    footer.appendChild(idpill);
    meta.appendChild(h);meta.appendChild(sub);meta.appendChild(p);meta.appendChild(footer);
    card.appendChild(img);card.appendChild(meta);
    resultsEl.appendChild(card);
  })
}

async function fetchFromOmdb(query, apiKey){
  const sURL = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${encodeURIComponent(apiKey)}`;
  const sres = await fetch(sURL);
  const sjson = await sres.json();
  if(sjson.Response==='False') throw new Error(sjson.Error||'No results');
  // get details for each result (to obtain Plot)
  const details = await Promise.all(sjson.Search.slice(0,10).map(async r=>{
    try{
      const d = await fetch(`https://www.omdbapi.com/?i=${r.imdbID}&apikey=${encodeURIComponent(apiKey)}`);
      return await d.json();
    }catch(e){return r}
  }));
  return details.map(d=>({Title:d.Title,Year:d.Year,imdbID:d.imdbID,Type:d.Type,Poster:d.Poster,Plot:d.Plot}));
}

async function doSearch(){
  const q = qEl.value.trim();
  if(!q){statusEl.textContent='Please enter a search query.';resultsEl.innerHTML='';return}
  statusEl.textContent='Searching...';resultsEl.innerHTML='';
  if(useApiEl.checked && apiKeyEl.value.trim()){
    try{
      const res = await fetchFromOmdb(q, apiKeyEl.value.trim());
      renderResults(res);
    }catch(err){
      statusEl.textContent = 'OMDb error: ' + (err.message || err);
    }
  }else{
    // local search
    const ql = q.toLowerCase();
    const out = SAMPLE.filter(m=>m.Title.toLowerCase().includes(ql));
    renderResults(out);
  }
}

btn.addEventListener('click', doSearch);
qEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch() });

// small accessibility: focus the search box on load
window.addEventListener('load', ()=>qEl.focus());