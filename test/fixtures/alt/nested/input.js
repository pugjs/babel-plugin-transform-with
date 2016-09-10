// before1
// @with
{
  obj1 || {};
  // before2
  // @with
  {
    obj2 || {};
    // before3
    // @with
    {
      obj3 || {};
      console.log('hey');
    }
    // after3
  }
  // after2
}
// after1
