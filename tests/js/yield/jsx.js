function* f() {
  yield <div>generator</div>
  yield (<div>generator</div>)
  yield <div><p>generator</p></div>
  yield (<div><p>generator</p></div>)
}
