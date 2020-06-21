function create(a: any): { type: 'B', data: number } | { type: 'A', data: string }
{
  return {
    type: 'A',
    data: a
  }
}
