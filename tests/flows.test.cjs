// Sin dependencias: node --test tests/flows.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const source = html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
class DCLogic {
  constructor(props) { this.props = props; }
  setState(patch) { Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch); }
}
const { Component, routeStats, optimizeStops, readFlowState, ROUTE_LOCATIONS, RECYCLING_POINTS } = new Function('DCLogic', source + '\nreturn { Component, routeStats, optimizeStops, readFlowState, ROUTE_LOCATIONS, RECYCLING_POINTS };')(DCLogic);
const app = props => new Component({ defaultTab: 'mapa', ...props });

test('distance and time accumulate legs from the origin; points contribute no kilos', () => {
  const stats = routeStats(['p6', 'p7']);
  const expectedKm = (Math.hypot(19-12, 73-92) + Math.hypot(49-19, 74-73)) * .08;
  assert.ok(Math.abs(stats.distance - expectedKm) < 1e-10);
  assert.equal(stats.minutes, Math.ceil(expectedKm * 4 + 6));
  assert.equal(stats.kg, '0 kg');
  assert.equal(routeStats(['a1','a2']).kg.replace('.',','), '32,5 kg');
});

test('optimization preserves every stop, never worsens distance and is repeatable', () => {
  const ids = ['a1','a2','p8','p1','p7'];
  const optimized = optimizeStops(ids);
  assert.notDeepEqual(optimized, ids);
  assert.deepEqual([...optimized].sort(), [...ids].sort());
  assert.ok(routeStats(optimized).distance < routeStats(ids).distance);
  assert.deepEqual(optimizeStops(optimized), optimized);
  for (let i=0;i<ROUTE_LOCATIONS.length;i++) {
    const route=ROUTE_LOCATIONS.slice(i).map(p=>p.id).reverse();
    assert.ok(routeStats(optimizeStops(route)).distance <= routeStats(route).distance);
  }
});

test('empty, duplicate and malformed stops are safe', () => {
  assert.equal(routeStats([]).distance, 0);
  assert.equal(routeStats([]).minutes, 0);
  assert.deepEqual(optimizeStops([]), []);
  assert.deepEqual(routeStats(['p1','p1','unknown']).stops.map(s=>s.id), ['p1']);
  assert.deepEqual(readFlowState({stops:'none'}).routeIds, []);
  assert.deepEqual(readFlowState({stops:'wrong,p2,p2'}).routeIds, ['p2']);
});

test('all eight points can be added once and survive the route URL', () => {
  const c=app();
  for(const p of RECYCLING_POINTS) {
    c.renderVals().points.find(row=>row.id===p.id).addToRoute();
    c.renderVals().points.find(row=>row.id===p.id).addToRoute();
  }
  assert.equal(c.state.routeIds.length,10);
  const restored=app(c.routeParams());
  assert.deepEqual(restored.state.routeIds,c.state.routeIds);
  assert.equal(restored.renderVals().routeKg,'32,5 kg');
});

test('saving validates a name and snapshots stops without sharing mutable arrays', () => {
  const c=app(); c.saveRoute();
  assert.match(c.state.formError,/nombre/);
  c.state.routeName='  Mi ruta  '; c.state.routeDescription='  Ruta de prueba  '; c.saveRoute();
  const saved=c.state.savedRoutes.at(-1);
  assert.equal(saved.name,'Mi ruta'); assert.equal(saved.description,'Ruta de prueba');
  c.state.routeIds.push('p8'); assert.deepEqual(saved.stops,['a1','a2']);
  c.state.routeIds=[]; c.saveRoute(); assert.match(c.state.formError,/parada/);
});

test('loading and deleting saved routes preserve the current route independently', () => {
  const c=app(); c.renderVals().savedRoutes.find(r=>r.id==='costa').load();
  assert.deepEqual(c.state.routeIds,['p1','p5','p6']);
  c.renderVals().savedRoutes.find(r=>r.id==='costa').remove();
  assert.deepEqual(c.state.routeIds,['p1','p5','p6']);
  assert.equal(c.state.savedRoutes.length,2);
  assert.equal(c.state.loadedRoute,'');
});

test('rescheduling validates date and changes only the selected delivery', () => {
  const c=app({defaultTab:'recojos'}); c.openAction('reprogramar','r2');
  c.state.scheduleDate='2030-02-30'; c.confirmAction(); assert.match(c.state.formError,/fecha/);
  c.state.scheduleDate='2099-09-15'; c.state.scheduleSlot='14:00–18:00'; c.confirmAction();
  assert.equal(c.delivery('r2').state,'Reprogramado');
  assert.equal(c.delivery('r2').window,'15/09/2099 · 14:00–18:00');
  assert.equal(c.delivery('r1').state,'En camino');
  const restored=app(c.routeParams()); assert.equal(restored.delivery('r2').state,'Reprogramado');
});

test('canceling requires a reason and removes only the associated route stop', () => {
  const c=app({stops:'a1,a2,p1'}); c.openAction('cancelar','r1');c.confirmAction();
  assert.match(c.state.formError,/motivo/);assert.equal(c.delivery('r1').state,'En camino');
  c.state.reason='  Cambio de disponibilidad  ';c.confirmAction();
  assert.equal(c.delivery('r1').state,'Cancelado');assert.equal(c.delivery('r1').reason,'Cambio de disponibilidad');
  assert.deepEqual(c.state.routeIds,['a2','p1']);
  c.renderVals().savedRoutes.find(r=>r.id==='centro').load();assert.ok(!c.state.routeIds.includes('a1'));
});

test('priority toggles independently on either role and is restored from the URL', () => {
  const c=app();c.deliveryRow({id:'r2'}).togglePriority();c.deliveryRow({id:'g1'}).togglePriority();
  const restored=app(c.routeParams());assert.equal(restored.delivery('r2').priority,true);assert.equal(restored.delivery('g1').priority,true);
  c.deliveryRow({id:'r2'}).togglePriority();assert.equal(c.delivery('r2').priority,false);assert.equal(c.delivery('g1').priority,true);
});

test('closed rows cannot be canceled, rescheduled or confirmed again', () => {
  const c=app();c.openAction('cancelar','r3');c.state.reason='No aplica';c.confirmAction();
  assert.equal(c.delivery('r3').state,'Completado');assert.equal(c.state.rowUpdates.r3,undefined);
  c.openAction('qr','r3');c.confirmDelivery();assert.equal(c.state.rateOpen,false);
});

test('chat entry retains generator role and delivery context', () => {
  const c=app({defaultTab:'publicaciones'});c.renderVals().publications[0].openChat();
  assert.equal(c.role(),'generador');assert.equal(c.tab(),'chats');assert.equal(c.state.chatRow,'g1');assert.equal(c.renderVals().chatCanTrack,true);
});

test('each scanner opens its own delivery and rejects another delivery code', () => {
  const c=app({defaultTab:'recojos'});c.renderVals().pickups[1].openScanner();
  assert.equal(c.state.actionRow,'r2');assert.match(c.renderVals().scannerTitle,/Bodega Olivo/);
  c.state.manualCode='QH-R1';c.confirmDelivery(true);assert.match(c.state.formError,/no corresponde/);
  assert.equal(c.delivery('r2').state,'Confirmado');
  c.state.manualCode='qh-r2';c.confirmDelivery(true);
  assert.equal(c.delivery('r2').state,'Completado');assert.equal(c.delivery('r1').state,'En camino');
  assert.equal(c.state.confirmedRow,'r2');assert.match(c.renderVals().confirmedTitle,/8,5 kg/);
  assert.deepEqual(c.state.routeIds,['a1']);
});

test('tracking is exposed only for generators and deliveries in transit', () => {
  const c=app({defaultTab:'publicaciones',track:'g1',progress:'100'});
  assert.equal(c.renderVals().trackingVisible,true);assert.equal(c.state.trackingStart,100);
  c.changeDelivery('g1',{state:'Cancelado',reason:'Cambio'});assert.equal(c.renderVals().trackingVisible,false);
  assert.equal(!!app({defaultTab:'chats',role:'reciclador',track:'g1'}).renderVals().trackingVisible,false);
});

test('invalid URL updates cannot inject unknown rows, states, or impossible dates', () => {
  const state=readFlowState({updates:JSON.stringify({wrong:{state:'Cancelado'},r1:{state:'Inventado',date:'2030-02-30',slot:'x'}}),priority:'wrong,r2',progress:'999'});
  assert.equal(state.rowUpdates.wrong,undefined);assert.equal(state.rowUpdates.r1.state,undefined);assert.equal(state.rowUpdates.r1.date,undefined);
  assert.equal(state.rowUpdates.r2.priority,true);assert.equal(state.trackingStart,100);
  assert.doesNotThrow(()=>readFlowState({updates:'<not-json>'}));
});
