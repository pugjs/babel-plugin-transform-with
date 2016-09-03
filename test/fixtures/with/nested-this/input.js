// before1
with ({}) {
  // before2
  with ({}) {
    // before3
    with ({}) {
      console.log(this.getStr());
    }
    // after3
  }
  // after2
}
// after1
