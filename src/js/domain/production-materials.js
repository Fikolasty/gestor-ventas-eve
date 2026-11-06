/* Production stock and shipping domain.
 * Stock is session input. Shipping is the owner's manual batch total in cents,
 * shared equally by selected material lots with actual shipped units > 0.
 * This does not implement or replace SIGMA contract billing or Sales allocation.
 */
function productionWhole(value,name){
  if(!Number.isSafeInteger(value)||value<0)throw new RangeError(name+' must be a nonnegative safe integer');
  return value;
}
function productionStock(required,owned){
  productionWhole(required,'required');productionWhole(owned,'owned');
  const used=Math.min(required,owned);
  return {required,owned,used,missing:required-used,remaining:owned-used};
}
function productionShipping(totalCents,lots){
  productionWhole(totalCents,'totalCents');
  const ids=new Set();
  const rows=lots.map(lot=>{
    productionWhole(lot.typeId,'typeId');productionWhole(lot.units,'units');
    if(lot.typeId===0||ids.has(lot.typeId))throw new RangeError('Material type IDs must be positive and unique');
    if(typeof lot.selected!=='boolean')throw new TypeError('selected must be boolean');
    ids.add(lot.typeId);
    return {typeId:lot.typeId,units:lot.units,selected:lot.selected,shippingCents:0};
  });
  const eligible=rows.filter(row=>row.selected&&row.units>0).sort((a,b)=>a.typeId-b.typeId);
  if(!eligible.length)return {complete:totalCents===0,totalCents,allocatedCents:0,unallocatedCents:totalCents,rows};
  const part=Math.floor(totalCents/eligible.length),residue=totalCents-part*eligible.length;
  // At most one extra cent per lot; stable by type ID, independent of UI sorting.
  eligible.forEach((row,index)=>{row.shippingCents=part+(index<residue?1:0);});
  return {complete:true,totalCents,allocatedCents:totalCents,unallocatedCents:0,rows};
}
