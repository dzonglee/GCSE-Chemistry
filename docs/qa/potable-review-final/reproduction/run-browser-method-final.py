import subprocess
from pathlib import Path
r=Path('/workspace/course-audit/potable-review');root='/workspace/chemistry-potable-candidate'
for name,args in [('browser-new-method-final.log',['--config=/workspace/potable-review-tools/candidate.config.ts','potable-review.browser.spec.ts']),('browser-retained-method-final.log',['--config=/workspace/potable-review-tools/retained.config.ts',r'(^|/)water\.browser\.spec\.ts$']),('browser-storage-method-final.log',['--config=/workspace/potable-review-tools/retained.config.ts','learning.browser.spec.ts','--grep','blocked storage|corrupt data|another tab|simultaneous tab|immediate refresh'])]:
 with (r/name).open('w') as f:subprocess.run(['npx','playwright','test',*args],cwd=root,stdout=f,stderr=subprocess.STDOUT,check=True)
 print(name+' actual exit0',flush=True)
