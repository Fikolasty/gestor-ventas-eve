// ================= Comparativa Minera, aislada del motor del Gestor =================
/*__MINING__*/

// Skills runs in an isolated view and cannot modify the sales/mining CSS or formulas.
/*__SKILLS__*/


const miningGuide=document.querySelector('#mining .lunar-guide');
const miningGuideTools=document.querySelector('#mining .guide-tools');
miningGuideTools.addEventListener('click',event=>{
  const button=event.target.closest('[data-guide-view]');
  if(!button)return;
  const view=button.dataset.guideView;
  for(const tab of miningGuideTools.querySelectorAll('button')){
    tab.setAttribute('aria-pressed',String(tab===button));
  }
  miningGuide.hidden=view!=='guide';
  const tools=$('mnRoot');
  tools.hidden=view==='guide';
  if(view==='guide')return;
  tools.querySelector('[data-mining-jump=ships]')?.click();
  if(view==='fits')tools.querySelector('.mn-analysis-tabs [data-tab=fits]')?.click();
  const section={scenario:'.mn-scenario-hero',compare:'.mn-results-header',fits:'.mn-analysis-panels'}[view];
  tools.querySelector(section)?.scrollIntoView({block:'start'});
});
$('copy-vrd').addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText($('vrd-fit').textContent);
    $('fit-status').textContent=tx('lunar.copied');
  }catch{
    $('fit-status').textContent=tx('lunar.copyFailed');
  }
});
