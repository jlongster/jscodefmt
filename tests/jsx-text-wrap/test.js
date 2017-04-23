// Wrapping text
x =
  <div>
    Some text that would need to wrap on to a new line in order to display correctly and nicely
  </div>

// Wrapping tags
x =
  <div>
    <first>f</first> <first>f</first> <first>f</first> <first>f</first> <first>f</first> <first>f</first>
  </div>

// Wrapping tags
x =
  <div>
    <first>f</first><first>f</first><first>f</first><first>f</first><first>f</first><first>f</first>
  </div>

// Wrapping tags
x =
  <div>
    <a /><b /><c />
    <first>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</first> <first>f</first>
  </div>

// Wrapping tags
x =
  <div>
    <sadashdkjahsdkjhaskjdhaksjdhkashdkashdkasjhdkajshdkashdkashd /> <first>f</first>
  </div>

x =
  <div>
    before<div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at mollis lorem.</div>after
  </div>

x =
  <div>
    before{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}{stuff}{stuff}after{stuff}after
  </div>

x =
  <div>
    before {stuff} after {stuff} after {stuff} after {stuff} after {stuff} after {stuff}  {stuff}  {stuff} after {stuff} after
  </div>

x =
  <div>
    Please state your <b>name</b> and <b>occupation</b> for the board of <b>school</b> directors.
  </div>

function DiffOverview(props) {
  const { source, target, since } = props;
  return (
    <div>
      <div className="alert alert-info">
        <p>
          This diff overview is computed against the current list of records in
          this collection and the list it contained on <b>{humanDate(since)}</b>.
        </p>
        <p>
          <b>Note:</b> <code>last_modified</code> and <code>schema</code> record metadata
          are omitted for easier review.
        </p>
      </div>
      <Diff source={source} target={target} />
    </div>
  );
}

x = <font size={-3}><i>Starting at minute {graphActivity.startTime}, running for {graphActivity.length} to minute {graphActivity.startTime + graphActivity.length}</i></font>
