declare class D1<T> // 1
mixins C<T> {}

declare class D2<T> // 1
mixins C<T> // 2
{}

declare class D3<T> // 1
// 2
mixins C<T> // 3
{}

declare class D4<T> // 1
// 2
extends B<T>
mixins C<T> // 3
{}

declare class D5<T> // 1
extends B<T>
// 2
mixins C<T> // 3
{}
