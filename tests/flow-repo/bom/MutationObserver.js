/* @flow */

// constructor
function callback(arr: Array<MutationRecord>, observer: MutationObserver): void {
  return;
}
const o: MutationObserver = new MutationObserver(callback); // correct
new MutationObserver((arr: Array<MutationRecord>) => true); // correct
new MutationObserver(() => {}); // correct
new MutationObserver(); // incorrect
new MutationObserver(42); // incorrect
new MutationObserver((n: number) => {}); // incorrect

// observe
const div = document.createElement('div');
o.observe(div, { attributes: true, attributeFilter: ['style'] }); // correct
o.observe(div, { characterData: true, invalid: true }); // correct
o.observe(); // incorrect
o.observe('invalid'); // incorrect
o.observe(div); // incorrect
o.observe(div, {}); // incorrect
o.observe(div, { subtree: true }); // incorrect
o.observe(div, { attributes: true, attributeFilter: true }); // incorrect

// takeRecords
o.takeRecords(); // correct

// disconnect
o.disconnect(); // correct
