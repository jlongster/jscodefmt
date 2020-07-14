// @flow

const mapDispatch: MapDispatch<*> = (dispatch, props) => ({
  ...props,
  onInit: ({ user }: { user: Some_user }) => {
    if (user) {
      const { name } = user;
      switch (user.__typename) {
        case "A": {
          dispatch(user.onInitByQuery("A"));
          break;
        }
        case "B":
          dispatch(user.onInitByQuery("B"));
          break;
        case "C":
          dispatch(user.onInitByQuery("C"));
          break;
        default:
          /* :: (user.__typename: empty); */ // eslint-disable-line
          break;
      }
      dispatch(
        user.onInitByQuery({
          user: { firstName: first_name, lastName: last_name },
        }),
      );
    }
  },
});

type Props = {|
  ...$Exact<PropsWithTFn>,
  ...$Exact<$Call<typeof mapStateToProps, *, *>>,
  ...$Exact<$Call<typeof mapDispatch, *, *>>,
  ...$Exact<withResponse.WithQueryProps<RootQuery>>,
|};

/* :: (kind: empty);*/
export const A: T<V> = 0;
