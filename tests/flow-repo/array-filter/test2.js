/* @flow */

function filterItems(items: Array<string|number>): Array<string|number> {
  return items.map(item => {
    if (typeof item === 'string') {
      return item.length > 2 ? item : null;
    } else {
      return item*10;
    }
  }).filter(Boolean);
}

const filteredItems = filterItems(['foo', 'b', 1, 2]);

console.log(filteredItems);
