| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| bordered | Toggles rendering of the border around the list | boolean | false |
| footer | List footer renderer | string\|ReactNode | - |
| grid | The grid type of list. You can set grid to something like {gutter: 16, column: 4} | object | - |
| header | List header renderer | string\|ReactNode | - |
| itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string | - |
| rowKey | Item's unique key, could be a string or function that returns a string | string\|Function(record):string | `key` |
| loading | Shows a loading indicator while the contents of the list are being fetched | boolean\|[object](https://ant.design/components/spin-cn/#API) ([more](https://github.com/ant-design/ant-design/issues/8659)) | false |
| loadMore | Shows a load more content | string\|ReactNode | - |
| locale | i18n text including empty text | object | emptyText: 'No Data' <br> |
| pagination | Pagination [config](https://ant.design/components/pagination/), hide it by setting it to false | boolean \| object | false |
| split | Toggles rendering of the split under the list item | boolean | true |