import pathlib,json,hashlib,sys
c=pathlib.Path('/workspace/chemistry-potable-candidate');r=pathlib.Path('/workspace/course-audit/potable-review'); f=r/sys.argv[2]
def hashes():
 return {str(p.relative_to(c)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(c.rglob('*')) if p.is_file() and not any(x in p.relative_to(c).parts for x in ['node_modules','test-results','playwright-report','.git'])}
if sys.argv[1]=='save':
 h=hashes();f.write_text(json.dumps(h,indent=2)+'\n');print('Frozen',len(h))
else:
 old=json.loads(f.read_text());h=hashes();bad=[p for p in old if old[p]!=h.get(p)];new=[p for p in h if p not in old];print(json.dumps({'files':len(old),'changed':bad,'new':new}));assert not bad and not new
