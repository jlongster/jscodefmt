// @noflow

/* ensure there are no unintended side effects when trying branches */

({type: 'B', id: 'hi'}: {
  type: 'A';
  id: ?string;
} | {
  type: 'B';
  id: string;
});
