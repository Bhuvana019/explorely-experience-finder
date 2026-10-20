"""Conservative Wikimedia Commons image matcher for South India catalogue.
Run after setup: python refresh_south_india_images.py
Uses slow request spacing and retries HTTP 429. Only replaces the generic starter image when a reasonably relevant title match exists.
"""
import json, re, time, random
from pathlib import Path
import requests
from app.database import SessionLocal
from app.models import Experience
ROOT=Path(__file__).resolve().parent
DATA=ROOT/'south_india_places.json'; OUT=ROOT/'app'/'static'/'images'/'places'
API='https://commons.wikimedia.org/w/api.php'
S=requests.Session(); S.headers.update({'User-Agent':'ExplorelyStudentProject/1.0 (South India catalogue image retrieval; polite contact via Wikimedia Commons API policy)'})
STOP={'visit','walk','tour','view','beach','temple','fort','museum','park','trail','food','experience','historical','india','south','north','goa','kerala','karnataka','tamil','nadu','andhra','telangana','puducherry'}
def toks(s): return {w for w in re.findall(r'[a-z0-9]+',(s or '').lower()) if len(w)>2 and w not in STOP}
def request(params):
    for attempt in range(5):
        try:
            r=S.get(API,params=params,timeout=30)
            if r.status_code==429:
                wait=min(90,15*(attempt+1))+random.uniform(1,4); print(f'Rate limited; waiting {wait:.0f}s'); time.sleep(wait); continue
            r.raise_for_status(); time.sleep(3+random.uniform(0.5,1.5)); return r.json()
        except requests.RequestException as e:
            if attempt==4: raise
            time.sleep(5*(attempt+1))
    return {}
def find_image(item):
    name=toks(item['name']); city=toks(item['destination'])
    q=' '.join(sorted(name|city)) or item['name']
    data=request({'action':'query','format':'json','generator':'search','gsrsearch':q,'gsrnamespace':6,'gsrlimit':10,'prop':'imageinfo','iiprop':'url|mime|extmetadata','iiurlwidth':1200})
    pages=(data.get('query') or {}).get('pages') or {}
    cand=[]
    for p in pages.values():
        info=(p.get('imageinfo') or [{}])[0]; title=p.get('title',''); url=info.get('thumburl') or info.get('url','')
        if not url or not info.get('mime','').startswith('image/') or info.get('mime')=='image/svg+xml': continue
        tt=toks(title); overlap=len(name&tt); city_overlap=len(city&tt)
        if overlap:
            cand.append((overlap*3+city_overlap,title,url,info))
    cand.sort(reverse=True,key=lambda x:x[0])
    return cand[0] if cand and cand[0][0]>=3 else None
def main():
    records=json.loads(DATA.read_text(encoding='utf-8')); OUT.mkdir(parents=True,exist_ok=True); updated=0; skipped=[]
    with SessionLocal() as db:
        for item in records:
            if item.get('record_type')=='restaurant': continue
            row=db.query(Experience).filter(Experience.name==item['name'],Experience.destination==item['destination']).first()
            if not row: skipped.append((item['name'],'not found in DB')); continue
            try:
                match=find_image(item)
                if not match: skipped.append((item['name'],'no confident title match')); continue
                score,title,url,info=match
                # Keep source attribution metadata in a sidecar manifest for licensing review.
                extmeta=info.get('extmetadata') or {}
                rr=S.get(url,timeout=35)
                if rr.status_code==429:
                    skipped.append((item['name'],'image download rate-limited; rerun later')); time.sleep(30); continue
                rr.raise_for_status(); ct=rr.headers.get('content-type','')
                if not ct.startswith('image/'): skipped.append((item['name'],'not an image response')); continue
                ext='.jpg' if 'jpeg' in ct else '.png' if 'png' in ct else '.webp' if 'webp' in ct else '.img'
                filename=f'{row.experience_id}-{re.sub(r"[^a-z0-9]+","-",row.name.lower()).strip("-")[:55]}{ext}'
                (OUT/filename).write_bytes(rr.content); local='/static/images/places/'+filename
                row.image_url=local; row.gallery_json=json.dumps([local])
                (OUT/'image_attribution_manifest.jsonl').open('a',encoding='utf-8').write(json.dumps({'experience':row.name,'commons_file':title,'source_url':info.get('descriptionurl'),'license':(extmeta.get('LicenseShortName') or {}).get('value'),'artist':(extmeta.get('Artist') or {}).get('value')},ensure_ascii=False)+'\n')
                updated+=1; print('UPDATED',row.name,'<-',title)
            except Exception as e: skipped.append((item['name'],str(e)))
        db.commit()
    print(f'Images updated: {updated}')
    if skipped:
        print('Needs review/retry:')
        for name,why in skipped: print('-',name,':',why)
if __name__=='__main__': main()
