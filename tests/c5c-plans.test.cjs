const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('src/shell.html','utf8');
const picker=fs.readFileSync('src/js/ui/plan-picker.js','utf8');
const view=fs.readFileSync('src/js/ui/selling-results.js','utf8');
const workflow=fs.readFileSync('.github/workflows/candidate-plan.yml','utf8');
test('C.5c portals sort through the canonical select with viewport and keyboard support',()=>{
  assert.match(picker,/document\.body\.append\(planSortMenu\)/);
  assert.match(picker,/planSortSelect\.dispatchEvent\(new Event\('change'/);
  for(const key of ['Escape','ArrowDown','ArrowUp','Home','End','Tab'])assert.ok(picker.includes("'"+key+"'"));
  assert.match(picker,/visualViewport/);
  assert.match(picker,/pointerdown/);
  assert.equal((html.match(/id="pkSort"/g)||[]).length,1);
});
test('C.5c analysis consumes the original segments and never calculates a second financial plan',()=>{
  assert.match(view,/paintPlanDonut\(segs,sum,P\)/);
  const analysis=picker.slice(picker.indexOf('function paintPlanAnalysis'),picker.indexOf('const PK_FAST'));
  assert.doesNotMatch(analysis,/computePlan\(|modeTotal\(|C\.tax\s*=/);
  for(const id of ['pkAnalysisRoute','pkAdvantages','pkTradeoffs','pkAnalysisEconomy','pkAnalysisFacts'])
    assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
});
test('candidate workflow cannot publish Pages or write the main distributable',()=>{
  assert.match(workflow,/branches: \[feature\/elige-tu-plan-1\.0\.166\]/);
  assert.match(workflow,/contents: read/);
  assert.doesNotMatch(workflow,/git push|deploy-pages|upload-pages-artifact|contents: write|pages: write/);
  const prod=fs.readFileSync('.github/workflows/rebuild-market-moves.yml','utf8');
  assert.match(prod,/if: github.ref == 'refs\/heads\/main'/);
  assert.match(prod,/python3 build.py 1\.0\.174/);
});
